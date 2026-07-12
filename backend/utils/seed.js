const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Agent = require('../models/Agent');
const Complaint = require('../models/Complaint');
const Feedback = require('../models/Feedback');
const ChatMessage = require('../models/ChatMessage');

dotenv.config({ path: __dirname + '/../.env' });

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/complaint_db';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear old data
    await User.deleteMany();
    await Agent.deleteMany();
    await Complaint.deleteMany();
    await Feedback.deleteMany();
    await ChatMessage.deleteMany();
    console.log('Cleared existing data.');

    // Seed Users
    const admin = new User({
      name: 'System Admin',
      email: 'admin@cms.com',
      password: 'admin123',
      phone: '+1234567890',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&h=100',
      isVerified: true,
    });

    const agent = new User({
      name: 'Sarah Support',
      email: 'agent@cms.com',
      password: 'agent123',
      phone: '+1987654321',
      role: 'AGENT',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100',
      isVerified: true,
    });

    const agent2 = new User({
      name: 'John Hardware',
      email: 'john@cms.com',
      password: 'agent123',
      phone: '+1987654322',
      role: 'AGENT',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100',
      isVerified: true,
    });

    const user = new User({
      name: 'David Client',
      email: 'user@cms.com',
      password: 'user123',
      phone: '+1122334455',
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100',
      isVerified: true,
    });

    await admin.save();
    await agent.save();
    await agent2.save();
    await user.save();
    console.log('Users seeded.');

    // Seed Agent Specializations
    await Agent.create([
      {
        userId: agent._id,
        specialization: 'Technical Support',
        activeComplaints: 1,
        resolvedComplaints: 2,
        averageResolutionTime: 45, // 45 minutes
        performanceScore: 4.8,
      },
      {
        userId: agent2._id,
        specialization: 'Hardware',
        activeComplaints: 0,
        resolvedComplaints: 0,
        averageResolutionTime: 0,
        performanceScore: 5.0,
      }
    ]);
    console.log('Agent profiles created.');

    // Seed Complaints
    const complaint1 = await Complaint.create({
      title: 'Broadband connection dropping frequently',
      description: 'My broadband internet connection drops every 10 minutes. I tried restarting the router but the issue persists. Need immediate technical help.',
      category: 'Technical Support',
      priority: 'High',
      status: 'In Progress',
      userId: user._id,
      assignedAgentId: agent._id,
    });

    const complaint2 = await Complaint.create({
      title: 'Overcharged in June invoice',
      description: 'The June invoice shows an extra charge of $25 under miscellaneous fees. I did not purchase any additional addons. Please refund.',
      category: 'Billing',
      priority: 'Medium',
      status: 'Pending',
      userId: user._id,
    });

    const complaint3 = await Complaint.create({
      title: 'Keyboard keys not working',
      description: 'The keys W, A, S, D on the office laptop keyboard are stuck and non-responsive. Need hardware check.',
      category: 'Hardware',
      priority: 'Low',
      status: 'Resolved',
      userId: user._id,
      assignedAgentId: agent._id,
      resolutionSummary: 'Keyboard keys cleaned and contacts re-seated. Confirmed fully operational.',
      resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    });

    console.log('Complaints seeded.');

    // Seed Chat Messages
    await ChatMessage.create([
      {
        complaintId: complaint1._id,
        senderId: user._id,
        senderRole: 'USER',
        message: 'Hi Sarah, are you looking into my internet issue? It is really blocking my work.',
      },
      {
        complaintId: complaint1._id,
        senderId: agent._id,
        senderRole: 'AGENT',
        message: 'Hello David, yes, I am currently running diagnostics on your line. It seems there is a line noise issue.',
      },
      {
        complaintId: complaint1._id,
        senderId: user._id,
        senderRole: 'USER',
        message: 'Thank you! Let me know if you need me to restart the modem.',
        isRead: true,
      }
    ]);

    // Seed Feedback for resolved complaint
    await Feedback.create({
      complaintId: complaint3._id,
      userId: user._id,
      rating: 5,
      comments: 'Excellent and quick resolution by Sarah Support. She fixed the keyboard in less than an hour.',
    });

    console.log('Chat logs and feedback seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
