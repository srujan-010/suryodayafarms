import express from 'express';
import prisma from '../utils/db.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ==========================================
// CUSTOMER ENDPOINTS
// ==========================================

// 1. Create a support ticket linked to an order
router.post('/tickets', protect, async (req, res, next) => {
  const { orderId, subject, message, imageUrl } = req.body;

  try {
    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message are required.' });
    }

    // Generate ticket number (SUP-XXXX)
    const ticket = await prisma.$transaction(async (tx) => {
      const lastTicket = await tx.supportTicket.findFirst({
        orderBy: { createdAt: 'desc' }
      });

      let nextNum = 1;
      if (lastTicket && lastTicket.ticketNumber) {
        const match = lastTicket.ticketNumber.match(/SUP-(\d+)/);
        if (match) {
          nextNum = parseInt(match[1], 10) + 1;
        }
      }
      const ticketNumber = `SUP-${String(nextNum).padStart(4, '0')}`;

      // Create support ticket
      const newTicket = await tx.supportTicket.create({
        data: {
          ticketNumber,
          userId: req.user.id,
          orderId: orderId || null,
          subject,
          status: 'OPEN',
          priority: 'MEDIUM',
        }
      });

      // Create initial message
      await tx.supportMessage.create({
        data: {
          ticketId: newTicket.id,
          senderId: req.user.id,
          role: 'CUSTOMER',
          message,
          imageUrl: imageUrl || null
        }
      });

      return newTicket;
    });

    res.status(201).json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
});

// 2. Get customer's support tickets
router.get('/tickets', protect, async (req, res, next) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.user.id },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, tickets });
  } catch (error) {
    next(error);
  }
});

// 3. Get specific support ticket details & conversation timeline
router.get('/tickets/:id', protect, async (req, res, next) => {
  try {
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            createdAt: true,
            totalAmount: true
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found.' });
    }

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
});

// 4. Customer reply to a support ticket
router.post('/tickets/:id/messages', protect, async (req, res, next) => {
  const { message, imageUrl } = req.body;

  try {
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found.' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create message
      const newMessage = await tx.supportMessage.create({
        data: {
          ticketId: ticket.id,
          senderId: req.user.id,
          role: 'CUSTOMER',
          message,
          imageUrl: imageUrl || null
        }
      });

      // Automatically reopen or set status back to OPEN if it was CLOSED/RESOLVED
      if (ticket.status === 'CLOSED' || ticket.status === 'RESOLVED') {
        await tx.supportTicket.update({
          where: { id: ticket.id },
          data: { status: 'OPEN' }
        });
      }

      return newMessage;
    });

    res.status(201).json({ success: true, message: result });
  } catch (error) {
    next(error);
  }
});


// ==========================================
// ADMIN ENDPOINTS (protect + adminOnly)
// ==========================================

// 5. Admin: List all tickets with filters
router.get('/admin/tickets', protect, adminOnly, async (req, res, next) => {
  const { status, priority, search } = req.query;

  try {
    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (priority && priority !== 'ALL') {
      where.priority = priority;
    }
    if (search) {
      where.OR = [
        { ticketNumber: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const tickets = await prisma.supportTicket.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        order: {
          select: {
            id: true,
            orderNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, tickets });
  } catch (error) {
    next(error);
  }
});

// 6. Admin: Get single ticket detail
router.get('/admin/tickets/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            createdAt: true
          }
        },
        order: {
          include: {
            orderItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true
                  }
                },
                variant: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found.' });
    }

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
});

// 7. Admin: Update ticket status and priority
router.put('/admin/tickets/:id', protect, adminOnly, async (req, res, next) => {
  const { status, priority } = req.body;

  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: req.params.id }
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found.' });
    }

    const data = {};
    if (status) data.status = status;
    if (priority) data.priority = priority;

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: req.params.id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({ success: true, ticket: updatedTicket });
  } catch (error) {
    next(error);
  }
});

// 8. Admin: Reply to ticket
router.post('/admin/tickets/:id/messages', protect, adminOnly, async (req, res, next) => {
  const { message, imageUrl } = req.body;

  try {
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: req.params.id }
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found.' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create admin message
      const newMessage = await tx.supportMessage.create({
        data: {
          ticketId: ticket.id,
          senderId: req.user.id,
          role: 'ADMIN',
          message,
          imageUrl: imageUrl || null
        }
      });

      // Update ticket status to IN_PROGRESS if it was OPEN
      if (ticket.status === 'OPEN') {
        await tx.supportTicket.update({
          where: { id: ticket.id },
          data: { status: 'IN_PROGRESS' }
        });
      }

      return newMessage;
    });

    res.status(201).json({ success: true, message: result });
  } catch (error) {
    next(error);
  }
});

export default router;
