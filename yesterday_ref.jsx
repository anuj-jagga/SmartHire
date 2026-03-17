import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import useAuthStore from '../store/authStore';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, ScreenShare, ScreenShareOff, Maximize, Minimize } from 'lucide-react';
import axios from 'axios';

const WebRTCInterview = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [peers, setPeers] = useState([]);
    const [stream, setStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);

    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef({});
    const cameraTrackRef = useRef(null);
    const localStreamRef = useRef(null);
    const screenStreamRef = useRef(null);
    const tracksRegistryRef = useRef([]); // To track EVERY single MediaStreamTrack created
    const containerRef = useRef(null);

    const [roomValidating, setRoomValidating] = useState(true);
    const [roomError, setRoomError] = useState(null);
    const [roomData, setRoomData] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const validateRoom = async () => {
            try {
                const res = await axios.get(`/api/applications/room/${roomId}`);
                const app = res.data;

                if (app.interviewDate) {
                    const now = new Date();
                    const scheduled = new Date(app.interviewDate);
                    const diffMin = (scheduled - now) / (1000 * 60);

                    if (diffMin > 15) {
                        setRoomError(`This interview is scheduled for ${scheduled.toLocaleString()}. You can join up to 15 minutes before the start time.`);
                        setRoomValidating(false);
                        return;
                    }
                }

                setRoomData(app);
                setRoomValidating(false);
            } catch (err) {
                console.error("Room validation failed", err);
                setRoomError(err.response?.data?.message || "Failed to access interview room.");
                setRoomValidating(false);
            }
        };

        validateRoom();
    }, [roomId, user, navigate]);

    function createPeerConnection(remoteSocketId, localStream) {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' },
                // Production TURN servers (placeholders)
                // { 
                //     urls: 'turn:your-turn-server.com:3478', 
                //     username: 'user', 
                //     credential: 'password' 
                // }
            ]
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current.emit('ice-candidate', {
                    target: remoteSocketId,
                    id: socketRef.current.id,
                    candidate: event.candidate
                });
            }
        };

        pc.ontrack = (event) => {
            pc.remoteStream = event.streams[0];
            setPeers(Object.entries(peersRef.current).map(([id, peerConn]) => ({ peerID: id, stream: peerConn.remoteStream })));
        };

        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

        return pc;
    }

    useEffect(() => {
        if (!user || roomValidating || roomError) return;

        const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        socketRef.current = io(serverUrl);

        let isMounted = true;

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
            if (!isMounted) {
                currentStream.getTracks().forEach(track => track.stop());
                return;
            }
            
            // Register tracks for nuclear cleanup
            currentStream.getTracks().forEach(track => {
                tracksRegistryRef.current.push(track);
                console.log(`Registered local track: ${track.kind}`);
            });

            setStream(currentStream);
            localStreamRef.current = currentStream;
            cameraTrackRef.current = currentStream.getVideoTracks()[0];
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }

            socketRef.current.emit('join-room', roomId, user._id);

            socketRef.current.on('user-connected', (remoteSocketId) => {
                const pc = createPeerConnection(remoteSocketId, currentStream);
                peersRef.current[remoteSocketId] = pc;

                pc.createOffer()
                    .then(offer => pc.setLocalDescription(offer))
                    .then(() => {
                        socketRef.current.emit('offer', {
                            target: remoteSocketId,
                            callerID: socketRef.current.id,
                            sdp: pc.localDescription
                        });
                    });
            });

            socketRef.current.on('offer', async (payload) => {
                const pc = createPeerConnection(payload.callerID, currentStream);
                peersRef.current[payload.callerID] = pc;

                await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                socketRef.current.emit('answer', {
                    target: payload.callerID,
                    id: socketRef.current.id,
                    sdp: pc.localDescription
                });
            });

            socketRef.current.on('answer', async (payload) => {
                const pc = peersRef.current[payload.id];
                if (pc) {
                    await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
                }
            });

            socketRef.current.on('ice-candidate', async (payload) => {
                const pc = peersRef.current[payload.id];
                if (pc && payload.candidate) {
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
                    } catch (e) {
                        console.error('Error adding received ice candidate', e);
                    }
                }
            });

            socketRef.current.on('user-disconnected', (remoteSocketId) => {
                if (peersRef.current[remoteSocketId]) {
                    peersRef.current[remoteSocketId].close();
                    delete peersRef.current[remoteSocketId];
                    setPeers(Object.entries(peersRef.current).map(([id, pc]) => ({ peerID: id, stream: pc.remoteStream })));
                }
            });

        }).catch(err => {
            console.error("Failed to get local stream", err);
            alert("Could not access camera/microphone. Please check permissions.");
        });

        // Listen for browser close/refresh
        window.addEventListener('beforeunload', destroyInterview);

        return () => {
            isMounted = false;
            window.removeEventListener('beforeunload', destroyInterview);
            destroyInterview();
        };
    }, [roomId, roomValidating, roomError, user]);

    const destroyInterview = () => {
        console.log("NUCLEAR CLEANUP STARTING...");
        
        // 1. Terminate all socket activity
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        // 2. Stop EVERY track in the registry
        tracksRegistryRef.current.forEach(track => {
            try {
                track.stop();
                track.enabled = false;
                console.log(`Successfully stopped registry track: ${track.kind}`);
            } catch (e) {
                console.warn("Error stopping track during nuclear cleanup", e);
            }
        });
        tracksRegistryRef.current = [];

        // 3. Close all peer connections
        Object.values(peersRef.current).forEach(pc => {
            try {
                pc.getSenders().forEach(sender => pc.removeTrack(sender));
                pc.close();
            } catch (e) {}
        });
        peersRef.current = {};

        // 4. Force detach video elements
        if (userVideo.current) userVideo.current.srcObject = null;

        // 5. Cleanup streams if they still exist
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => t.stop());
            localStreamRef.current = null;
        }
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(t => t.stop());
            screenStreamRef.current = null;
        }
        
        console.log("NUCLEAR CLEANUP COMPLETE.");
    };

    const toggleScreenShare = async () => {
        if (!isScreenSharing) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                screenStreamRef.current = screenStream;
                
                screenStream.getTracks().forEach(track => {
                    tracksRegistryRef.current.push(track);
                    console.log(`Registered screen track: ${track.kind}`);
                });

                const screenTrack = screenStream.getVideoTracks()[0];

                if (userVideo.current) {
                    userVideo.current.srcObject = new MediaStream([screenTrack, stream?.getAudioTracks()[0]].filter(Boolean));
                }

                Object.values(peersRef.current).forEach(pc => {
                    const videoSender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
                    if (videoSender) {
                        videoSender.replaceTrack(screenTrack);
                    }
                });

                setIsScreenSharing(true);

                screenTrack.onended = () => {
                    stopScreenShare();
                };
            } catch (error) {
                console.error("Error sharing screen", error);
            }
        } else {
            stopScreenShare();
        }
    };

    const stopMediaTracks = () => {
        destroyInterview();
    };

    const stopScreenShare = () => {
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => {
                track.stop();
                track.enabled = false;
            });
            screenStreamRef.current = null;
        }
        
        if (cameraTrackRef.current) {
            if (userVideo.current) {
                userVideo.current.srcObject = localStreamRef.current;
            }

            Object.values(peersRef.current).forEach(pc => {
                const videoSender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
                if (videoSender) {
                    videoSender.replaceTrack(cameraTrackRef.current);
                }
            });
        }
        setIsScreenSharing(false);
    };

    const toggleMute = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = isVideoOff; // enable if it was off, disable if it was on
                setIsVideoOff(!isVideoOff);
                
                // If turning it back on, give the video element a gentle nudge
                if (isVideoOff && userVideo.current) {
                    userVideo.current.play().catch(e => console.log('Video play interrupted:', e));
                }
            }
        }
    };

    const handleLeave = () => {
        destroyInterview();
        navigate('/dashboard');
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            if (containerRef.current) {
                containerRef.current.requestFullscreen().catch((err) => {
                    console.error(`Error attempting to enable fullscreen: ${err.message}`);
                });
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    useEffect(() => {
        let timeout;
        const handleMouseMove = () => {
            setShowControls(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => setShowControls(false), 3000);
        };

        document.addEventListener('mousemove', handleMouseMove);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(timeout);
        };
    }, []);

    if (roomValidating) {
        return <div style={{ height: '100vh', backgroundColor: '#0a0a0f', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>Validating Room Access...</div>;
    }

    if (roomError) {
        return (
            <div style={{ height: '100vh', backgroundColor: '#0a0a0f', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1.5rem' }}>
                <h2 style={{ fontSize: '2rem', color: '#ef4444', fontWeight: 'bold' }}>Access Denied</h2>
                <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: '400px', textAlign: 'center' }}>{roomError}</p>
                <button onClick={() => navigate('/dashboard')} style={{ padding: '0.75rem 2rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>Back to Dashboard</button>
            </div>
        );
    }

    return (
        <div ref={containerRef} style={{ height: '100vh', backgroundColor: 'var(--bg-base)', color: 'white', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            {/* Background Gradient Elements */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'var(--accent-primary)', filter: 'blur(150px)', opacity: '0.05', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'var(--accent-secondary)', filter: 'blur(150px)', opacity: '0.05', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }}></div>

            <header className="glass-panel" style={{ 
                margin: isFullscreen ? '0' : '1.5rem 1.5rem 0 1.5rem', 
                padding: '1rem 2rem', 
                display: isFullscreen ? 'none' : 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                zIndex: 10,
                borderRadius: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.6rem', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)' }}>
                            <ScreenShare size={18} color="white" />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SmartHire</h2>
                    </div>
                    
                    <div style={{ width: '1px', height: '1.5rem', background: 'rgba(255,255,255,0.1)' }}></div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Position:</span>
                        <span style={{ 
                            padding: '0.35rem 0.85rem', 
                            backgroundColor: 'rgba(124, 58, 237, 0.12)', 
                            color: '#c084fc', 
                            border: '1px solid rgba(124, 58, 237, 0.25)', 
                            borderRadius: '0.75rem', 
                            fontSize: '0.85rem', 
                            fontWeight: '600',
                            boxShadow: 'inset 0 0 10px rgba(124, 58, 237, 0.05)'
                        }}>
                            {roomData?.job?.title || 'General Interview Session'}
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>
                    <Users size={18} /> 
                    <span>{peers.filter(p => p.stream !== undefined).length + 1} Participant{peers.filter(p => p.stream !== undefined).length + 1 !== 1 ? 's' : ''}</span>
                </div>
            </header>

            <main style={{ flex: 1, padding: isFullscreen ? '0' : '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 5, overflow: 'hidden' }}>
                <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: isFullscreen ? '0' : '1.5rem', width: '100%', height: '100%',
                    justifyContent: 'center', alignItems: 'center'
                }}>

                    {/* Local User Video (PIP or Main) */}
                    <div className={peers.length > 0 || !isFullscreen ? "glass-panel" : ""} style={{
                        position: peers.length > 0 ? 'absolute' : 'relative',
                        bottom: peers.length > 0 ? (isFullscreen ? '7rem' : '2.5rem') : 'auto',
                        right: peers.length > 0 ? '2.5rem' : 'auto',
                        width: peers.length > 0 ? '300px' : 'auto',
                        height: peers.length > 0 ? '200px' : '100%',
                        maxWidth: peers.length > 0 ? '300px' : '100%',
                        maxHeight: peers.length > 0 ? '200px' : (isFullscreen ? '100vh' : 'calc(100vh - 220px)'),
                        aspectRatio: peers.length > 0 ? 'auto' : '16/9',
                        borderRadius: (peers.length > 0 || !isFullscreen) ? '1.25rem' : '0',
                        overflow: 'hidden', 
                        backgroundColor: '#000',
                        border: (peers.length > 0 || !isFullscreen) ? '1px solid rgba(255,255,255,0.1)' : 'none',
                        zIndex: 40, 
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: (peers.length > 0 || !isFullscreen) ? '0 25px 50px rgba(0,0,0,0.6)' : 'none'
                    }}>
                        {/* Camera Off Overlay */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            display: isVideoOff ? 'flex' : 'none',
                            flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                            backgroundColor: 'rgba(15, 23, 42, 0.9)', color: 'var(--text-muted)', zIndex: 10
                        }}>
                            <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                <VideoOff size={24} style={{ opacity: 0.7 }} />
                            </div>
                            <p style={{ fontWeight: '500', fontSize: '0.9rem' }}>Camera Off</p>
                        </div>

                        {/* Always render the video tag so it never loses the MediaStream ref */}
                        <video playsInline muted ref={userVideo} autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: isVideoOff ? 'none' : 'block' }} />
                        
                        <div className="glass-panel" style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: '500', zIndex: 11, display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isMuted ? '#ef4444' : '#10b981' }}></div>
                            You {isMuted ? '(Muted)' : ''}
                        </div>
                    </div>

                    {/* Remote Peers */}
                    {peers.map((peer, index) => {
                        if (!peer.stream) return null;
                        const isMulti = peers.length > 1;
                        return (
                            <div key={index} className={!isFullscreen ? "glass-panel" : ""} style={{
                                flex: isMulti ? '1 1 45%' : '0 1 auto',
                                width: isMulti ? '100%' : 'auto',
                                height: '100%',
                                aspectRatio: isMulti ? 'auto' : '16/9',
                                maxWidth: '100%',
                                maxHeight: isFullscreen ? '100vh' : 'calc(100vh - 220px)',
                                borderRadius: isFullscreen ? '0' : '1.25rem',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                border: isFullscreen ? 'none' : '1px solid rgba(255,255,255,0.05)',
                                backgroundColor: '#000',
                                boxShadow: isFullscreen ? 'none' : '0 15px 35px rgba(0,0,0,0.3)'
                            }}>
                                <VideoPlayer stream={peer.stream} />
                            </div>
                        );
                    })}

                    {peers.length === 0 && (
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                            <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                <Users size={32} color="var(--accent-primary)" />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: 'white' }}>Waiting for others...</h3>
                            <p style={{ color: 'var(--text-muted)' }}>The interview will begin when someone joins.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Floating Control Bar */}
            <footer style={{
                position: isFullscreen ? 'absolute' : 'relative',
                bottom: isFullscreen ? '2rem' : 'auto',
                left: isFullscreen ? '50%' : 'auto',
                transform: isFullscreen ? 'translateX(-50%)' : 'none',
                padding: '0 0 1.5rem 0',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                zIndex: 100,
                width: '100%',
                opacity: (isFullscreen && !showControls) ? 0 : 1,
                transition: 'opacity 0.3s ease'
            }}>
                <div className="glass-panel" style={{ 
                    display: 'flex', gap: '0.75rem', padding: '0.75rem 1.5rem', borderRadius: '100px', alignItems: 'center',
                    background: 'rgba(18, 18, 30, 0.85)', border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(20px)'
                }}>
                    <button onClick={toggleMute} style={{ 
                        width: '48px', height: '48px', borderRadius: '50%', border: 'none', 
                        backgroundColor: isMuted ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)', 
                        color: isMuted ? '#ef4444' : 'white', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'all 0.2s',
                        border: isMuted ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent'
                    }} title={isMuted ? "Unmute" : "Mute"}>
                        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                    
                    <button onClick={toggleVideo} style={{ 
                        width: '48px', height: '48px', borderRadius: '50%', border: 'none', 
                        backgroundColor: isVideoOff ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)', 
                        color: isVideoOff ? '#ef4444' : 'white', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'all 0.2s',
                        border: isVideoOff ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent'
                    }} title={isVideoOff ? "Turn on Camera" : "Turn off Camera"}>
                        {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                    </button>
                    
                    <div style={{ width: '1px', height: '28px', backgroundColor: 'rgba(255,255,255,0.08)', margin: '0 0.25rem' }}></div>
                    
                    <button onClick={toggleScreenShare} style={{ 
                        width: '48px', height: '48px', borderRadius: '50%', border: 'none', 
                        backgroundColor: isScreenSharing ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.05)', 
                        color: isScreenSharing ? '#60a5fa' : 'white', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'all 0.2s',
                        border: isScreenSharing ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent'
                    }} title={isScreenSharing ? "Stop sharing" : "Share screen"}>
                        {isScreenSharing ? <ScreenShareOff size={20} /> : <ScreenShare size={20} />}
                    </button>
                    
                    <button onClick={toggleFullScreen} style={{ 
                        width: '48px', height: '48px', borderRadius: '50%', border: 'none', 
                        backgroundColor: 'rgba(255,255,255,0.05)', 
                        color: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'all 0.2s'
                    }} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                    
                    <div style={{ width: '1px', height: '28px', backgroundColor: 'rgba(255,255,255,0.08)', margin: '0 0.25rem' }}></div>
                    
                    <button onClick={handleLeave} style={{ 
                        width: '48px', height: '48px', borderRadius: '50%', border: 'none', 
                        backgroundColor: '#ef4444', color: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'all 0.2s',
                        boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
                    }} title="Leave Interview">
                        <PhoneOff size={20} />
                    </button>
                </div>
            </footer>
        </div>
    );
};

const VideoPlayer = ({ stream }) => {
    const ref = useRef();
    useEffect(() => {
        if (ref.current && stream) {
            ref.current.srcObject = stream;
        }
    }, [stream]);
    return (
        <div style={{ width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#0a0a0f', position: 'relative' }}>
            <video playsInline autoPlay ref={ref} onLoadedMetadata={() => ref.current?.play()} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div className="glass-panel" style={{ position: 'absolute', top: '1rem', left: '1rem', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                Participant
            </div>
        </div>
    );
};

export default WebRTCInterview;
