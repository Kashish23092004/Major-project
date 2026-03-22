import React, { Suspense, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Sphere, Cylinder, Html, Float, Stars } from '@react-three/drei';
import { motion, useInView, animate } from 'framer-motion';
import { Zap, TrendingUp, PlayCircle, Clock, CheckCircle2 } from 'lucide-react';
import * as THREE from 'three';
import './LandingPage.css';

// --- NEW: SMOOTH NUMBER COUNTER COMPONENT ---
const AnimatedNumber = ({ from = 0, to, duration = 2, suffix = '', prefix = '', decimals = 0 }) => {
    const nodeRef = useRef(null);
    const inView = useInView(nodeRef, { once: true, margin: "-50px" });

    useEffect(() => {
        if (inView) {
            const controls = animate(from, to, {
                duration: duration,
                ease: "easeOut",
                onUpdate(value) {
                    if (nodeRef.current) {
                        nodeRef.current.textContent = `${prefix}${value.toFixed(decimals)}${suffix}`;
                    }
                },
            });
            return () => controls.stop();
        }
    }, [inView, from, to, duration, prefix, suffix, decimals]);

    return <span ref={nodeRef}>{prefix}{from.toFixed(decimals)}{suffix}</span>;
};

// --- ANIMATION VARIANTS ---
const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

// 🤖 THE CUTE ROBOT & LAPTOP SCENE 🤖
const CuteRobotScene = () => {
    useFrame((state) => {
        const scrollY = window.scrollY;
        const vh = window.innerHeight;
        const progress = Math.min(scrollY / vh, 1);

        state.camera.position.z = THREE.MathUtils.lerp(8, 1.4, progress);
        state.camera.position.y = THREE.MathUtils.lerp(1, 0.5, progress);
        state.camera.rotation.x = THREE.MathUtils.lerp(0, 0.08, progress);
    });

    return (
        <group>
            <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1.5} />

            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                {/* 🤖 ROBOT BODY */}
                <group position={[0, -1, -1]}>
                    <RoundedBox args={[1.5, 1.2, 1.2]} radius={0.3} position={[0, 2.5, 0]}>
                        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.8} />
                    </RoundedBox>
                    <RoundedBox args={[1.1, 0.5, 0.1]} radius={0.1} position={[0, 2.6, 0.6]}>
                        <meshBasicMaterial color="#00f2fe" />
                    </RoundedBox>
                    <Sphere args={[0.08, 16, 16]} position={[-0.3, 2.6, 0.65]}>
                        <meshBasicMaterial color="#ffffff" />
                    </Sphere>
                    <Sphere args={[0.08, 16, 16]} position={[0.3, 2.6, 0.65]}>
                        <meshBasicMaterial color="#ffffff" />
                    </Sphere>
                    
                    <Cylinder args={[0.05, 0.05, 0.6]} position={[0, 3.4, 0]}>
                        <meshStandardMaterial color="#475569" />
                    </Cylinder>
                    <Sphere args={[0.2, 16, 16]} position={[0, 3.7, 0]}>
                        <meshBasicMaterial color="#ec4899" />
                    </Sphere>
                    <RoundedBox args={[1.8, 1.5, 1.2]} radius={0.4} position={[0, 1, 0]}>
                        <meshStandardMaterial color="#334155" roughness={0.5} />
                    </RoundedBox>
                </group>

                {/* 💻 THE LAPTOP SCREEN */}
                <group position={[0, 0.2, 1.5]}>
                    <RoundedBox args={[4.2, 2.7, 0.1]} radius={0.1} position={[0, 1.5, 0]}>
                        <meshStandardMaterial color="#0f172a" roughness={0.2} />
                    </RoundedBox>
                    <RoundedBox args={[4, 2.5, 0.11]} radius={0.05} position={[0, 1.5, 0]}>
                        <meshBasicMaterial color="#4f46e5" transparent opacity={0.3} />
                    </RoundedBox>

                    <Html transform position={[0, 1.5, 0.08]} distanceFactor={3}>
                        <div className="hologram-ui">
                            <h2>SYSTEM.CORE.ONLINE</h2>
                            <div className="scanning-bar"></div>
                            <p>Awaiting Candidate Data...</p>
                        </div>
                    </Html>

                    <RoundedBox args={[4.2, 0.2, 2]} radius={0.05} position={[0, 0, 1]} rotation={[0.1, 0, 0]}>
                        <meshStandardMaterial color="#1e293b" roughness={0.7} />
                    </RoundedBox>
                </group>
            </Float>
        </group>
    );
};

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="cinematic-container">
            <div className="cyber-grid"></div>

            <div className="fixed-canvas-bg">
                <Canvas camera={{ position: [0, 1, 8], fov: 60 }} dpr={[1, 2]}>
                    <Suspense fallback={null}>
                        <ambientLight intensity={0.4} />
                        <directionalLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
                        <pointLight position={[0, 2, 3]} intensity={10} color="#00f2fe" distance={10} />
                        <pointLight position={[0, -2, -2]} intensity={5} color="#ec4899" distance={10} />
                        <CuteRobotScene />
                    </Suspense>
                </Canvas>
            </div>

            <div className="scroll-trigger-zone"></div>

            <div className="content-layer inside-screen">
                
                {/* --- 1. HERO SECTION --- */}
                <section className="hero-section">
                    <motion.div 
                        className="hero-text text-center mx-auto"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeUp} className="badge">VERSION 3.0 LIVE</motion.div>
                        <motion.h1 variants={fadeUp} className="hero-title">
                            Stop Guessing.<br />Start <span className="highlight-text animated-gradient">Scoring.</span>
                        </motion.h1>
                        <motion.p variants={fadeUp} className="hero-subtitle mx-auto">
                            You've entered the AI IELTS Core. We instantly grade your essays, analyze your speech, and prescribe targeted YouTube resources to guarantee your Band 8+.
                        </motion.p>
                        
                        {/* --- IMPLEMENTED HERO SCROLL COUNTERS --- */}
                        <motion.div variants={fadeUp} className="hero-stats mx-auto justify-center">
                            <div className="stat-item">
                                <span className="stat-number"><AnimatedNumber to={10} suffix="k+" duration={2} /></span>
                                <span className="stat-label">Hours Saved</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number"><AnimatedNumber to={0.2} decimals={1} suffix="s" duration={1.5} /></span>
                                <span className="stat-label">Grading Speed</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number"><AnimatedNumber to={8} prefix="Band " duration={2} /></span>
                                <span className="stat-label">Avg Output</span>
                            </div>
                        </motion.div>

                        <motion.button 
                            variants={fadeUp}
                            whileHover={{ scale: 1.05, boxShadow: "0px 0px 30px rgba(0, 242, 254, 0.5)" }}
                            whileTap={{ scale: 0.95 }}
                            className="glowing-btn massive-btn mt-8 shine-effect" 
                            onClick={() => navigate('/selection')}
                        >
                            Boot Up Your Mock Test
                        </motion.button>
                    </motion.div>
                </section>

                {/* --- 2. AI ADVANTAGE SECTION --- */}
                <section className="info-section">
                    <motion.div 
                        className="section-header text-center mx-auto"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeUp}
                    >
                        <h2>The <span className="highlight-text">AI Advantage</span></h2>
                        <p>Why relying on outdated PDFs is destroying your score.</p>
                    </motion.div>

                    <motion.div 
                        className="cards-grid"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeUp} className="glass-card premium-border">
                            <div className="card-glow" style={{ background: '#ec4899' }}></div>
                            <Zap className="card-icon" style={{ color: '#ec4899' }} />
                            <h3>Instant Writing Feedback</h3>
                            <p>Don't wait a week for a tutor. Our AI instantly evaluates your Task 1 & 2 for Lexical Resource, Grammar, and Cohesion.</p>
                        </motion.div>
                        <motion.div variants={fadeUp} className="glass-card premium-border">
                            <div className="card-glow" style={{ background: '#00f2fe' }}></div>
                            <PlayCircle className="card-icon" style={{ color: '#00f2fe' }} />
                            <h3>Smart Video Targeting</h3>
                            <p>Struggling with specific question types? We instantly embed the exact top-rated YouTube tutorial you need to fix it.</p>
                        </motion.div>
                        <motion.div variants={fadeUp} className="glass-card premium-border">
                            <div className="card-glow" style={{ background: '#8b5cf6' }}></div>
                            <TrendingUp className="card-icon" style={{ color: '#8b5cf6' }} />
                            <h3>Deep Analytics Engine</h3>
                            <p>Track your average band score over time, see section-wise performance, and predict your actual exam day score.</p>
                        </motion.div>
                    </motion.div>
                </section>

                {/* --- 3. BRUTAL REALITY STATS --- */}
                <section className="stats-section">
                    <motion.div 
                        className="stats-container holographic-box"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2>The Reality of the <span className="highlight-text">Exam</span></h2>
                        <div className="stats-grid">
                            
                            {/* --- IMPLEMENTED REALITY SCROLL COUNTERS --- */}
                            <div className="big-stat">
                                <h3><AnimatedNumber to={15} suffix="%" duration={2.5} /></h3>
                                <p>Of test-takers achieve a Band 8+ on their first attempt without structured AI feedback.</p>
                            </div>
                            <div className="big-stat">
                                <h3><AnimatedNumber to={11} suffix="k+" duration={2} /></h3>
                                <p>Institutions globally require this specific certification for your future.</p>
                            </div>
                            <div className="big-stat">
                                <h3><AnimatedNumber to={1} prefix="#" duration={1.5} /></h3>
                                <p>Reason for failing is the lack of real-time, personalized error-correction.</p>
                            </div>
                            
                        </div>
                    </motion.div>
                </section>

                {/* --- 4. EXAM BREAKDOWN --- */}
                <section className="exam-details-section">
                    <motion.div 
                        className="exam-box mx-auto premium-border"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <h2><Clock className="inline-icon" /> Master All 4 Modules</h2>
                        <p className="exam-box-sub">Simulate the real 2H 45M environment exactly as it happens on test day.</p>
                        
                        <div className="modules-breakdown">
                            {['Listening (30 Mins)', 'Reading (60 Mins)', 'Writing (60 Mins)', 'Speaking (14 Mins)'].map((mod, i) => (
                                <motion.div 
                                    key={i}
                                    className="module-item"
                                    whileHover={{ x: 10, backgroundColor: 'rgba(0, 242, 254, 0.05)' }}
                                >
                                    <CheckCircle2 className="module-check" />
                                    <span className="mod-name">{mod.split(' ')[0]}</span>
                                    <span className="mod-time">{mod.match(/\(([^)]+)\)/)[1]}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </section>

                {/* --- 5. CTA SECTION --- */}
                <section className="cta-section text-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.h2 variants={fadeUp} style={{ fontSize: '4.5rem', fontWeight: 900, marginBottom: '1rem' }}>
                            Initialize Your Future.
                        </motion.h2>
                        <motion.p variants={fadeUp} style={{ fontSize: '1.5rem', color: '#cbd5e1', maxWidth: '700px', margin: '0 auto 3rem auto' }}>
                            Take a free diagnostic test, let our AI map out your exact weak spots, and start upgrading your score today.
                        </motion.p>
                        <motion.button
                            variants={fadeUp}
                            whileHover={{ scale: 1.05, boxShadow: "0px 0px 50px #ec4899" }}
                            whileTap={{ scale: 0.95 }}
                            className="glowing-btn massive-btn shine-effect"
                            onClick={() => navigate('/auth')}
                            style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}
                        >
                            Enter The Platform
                        </motion.button>
                    </motion.div>
                </section>

            </div>
        </div>
    );
};

export default LandingPage;
