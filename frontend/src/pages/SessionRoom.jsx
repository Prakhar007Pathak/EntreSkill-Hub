import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Video, AlertCircle, Loader2,
    ExternalLink, RefreshCw
} from 'lucide-react';
import mentorService from '../services/mentorService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SessionRoom = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [jitsiLoaded, setJitsiLoaded] = useState(false);
    const jitsiContainerRef = useRef(null);
    const jitsiApiRef = useRef(null);

    useEffect(() => {
        fetchSession();
    }, [sessionId]);

    useEffect(() => {
        if (session?.jitsiRoomId && !jitsiLoaded) {
            loadJitsi();
        }
        return () => {
            if (jitsiApiRef.current) {
                jitsiApiRef.current.dispose();
            }
        };
    }, [session]);

    const fetchSession = async () => {
        try {
            // Get session from user sessions
            const res = await mentorService.getUserSessions();
            const found = res.data.sessions.find(s => s._id === sessionId);
            if (!found) {
                toast.error('Session not found');
                navigate('/my-sessions');
                return;
            }
            if (found.status !== 'scheduled') {
                toast.error('This session is not scheduled yet');
                navigate('/my-sessions');
                return;
            }
            if (found.type !== 'video_call') {
                toast.error('This is not a video call session');
                navigate('/my-sessions');
                return;
            }
            setSession(found);
        } catch (err) {
            toast.error('Failed to load session');
            navigate('/my-sessions');
        } finally {
            setLoading(false);
        }
    };

    const loadJitsi = () => {
        // Load Jitsi script dynamically
        const existingScript = document.getElementById('jitsi-script');
        if (existingScript) {
            initJitsi();
            return;
        }

        const script = document.createElement('script');
        script.id = 'jitsi-script';
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => initJitsi();
        script.onerror = () => toast.error('Failed to load Jitsi. Try opening the link directly.');
        document.head.appendChild(script);
    };

    const initJitsi = () => {
        if (!jitsiContainerRef.current || !session?.jitsiRoomId) return;
        if (jitsiApiRef.current) jitsiApiRef.current.dispose();

        try {
            const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
                roomName: session.jitsiRoomId,
                parentNode: jitsiContainerRef.current,
                width: '100%',
                height: '100%',
                userInfo: {
                    displayName: user?.fullName || 'User',
                    email: user?.email || ''
                },
                configOverwrite: {
                    startWithAudioMuted: true,
                    startWithVideoMuted: false,
                    enableClosePage: false,
                    disableDeepLinking: true,
                    prejoinPageEnabled: false
                },
                interfaceConfigOverwrite: {
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'desktop',
                        'chat', 'raisehand', 'tileview',
                        'hangup'
                    ]
                }
            });

            api.addEventListener('readyToClose', () => {
                navigate('/my-sessions');
            });

            jitsiApiRef.current = api;
            setJitsiLoaded(true);
        } catch (err) {
            console.error('Jitsi init error:', err);
            toast.error('Failed to initialize video call');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={40} className="animate-spin text-purple-400 mx-auto mb-4" />
                    <p className="text-gray-300">Loading session...</p>
                </div>
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            {/* Top Bar */}
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/my-sessions')}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Video size={16} className="text-white" />
                    </div>
                    <div>
                        <p className="text-white font-semibold text-sm">{session.topic}</p>
                        <p className="text-gray-400 text-xs">
                            with {session.mentorId?.fullName || 'Mentor'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Open in new tab fallback */}
                    <a
                        href={session.jitsiRoomUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-600 transition-all"
                    >
                        <ExternalLink size={12} />
                        Open in Browser
                    </a>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-green-400 text-xs font-medium">Live</span>
                    </div>
                </div>
            </div>

            {/* Jitsi Container */}
            <div className="flex-1 relative">
                <div
                    ref={jitsiContainerRef}
                    className="absolute inset-0"
                />

                {!jitsiLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl flex items-center justify-center mb-6"
                        >
                            <Video size={36} className="text-white" />
                        </motion.div>
                        <h2 className="text-white text-xl font-bold mb-2">
                            Connecting to Session...
                        </h2>
                        <p className="text-gray-400 text-sm mb-6 text-center max-w-sm">
                            Setting up your secure video call room. This may take a moment.
                        </p>
                        <Loader2 size={24} className="animate-spin text-purple-400 mb-6" />

                        {/* Fallback */}
                        <p className="text-gray-500 text-sm mb-2">Having trouble?</p>
                        <a
                            href={session.jitsiRoomUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm"
                        >
                            <ExternalLink size={14} />
                            Open in New Tab
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SessionRoom;