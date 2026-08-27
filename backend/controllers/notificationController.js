const Notification = require('../models/Notification');
const Student = require('../models/Student');

exports.getNotifications = async (req, res) => {
    try {
        const { userId, role, roles, branch } = req.query;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const roleList = roles ? roles.split(',') : (role ? [role] : []);

        const query = {
            $or: [
                { recipient: userId },
                { recipient: { $in: roleList } },
                {
                    recipient: 'all',
                    branch: { $in: ['all', branch || 'all'] }
                }
            ]
        };

        const notifications = await Notification.find(query).sort({ date: -1 }).limit(50);

        const notificationsWithReadStatus = notifications.map(notif => {
            const notifObj = notif.toObject();
            notifObj.isRead = notif.readBy.includes(userId);
            return notifObj;
        });

        res.status(200).json(notificationsWithReadStatus);
    } catch (error) {
        console.error("Get Notifications Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        if (!notification.readBy.includes(userId)) {
            notification.readBy.push(userId);
            await notification.save();
        }

        res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
        console.error("Mark Notification Read Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
