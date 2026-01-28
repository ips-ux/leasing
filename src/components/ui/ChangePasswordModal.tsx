import { useState } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const ChangePasswordModal = ({
    isOpen,
    onClose,
    onSubmit
}: ChangePasswordModalProps) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const resetForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess(false);
        setIsLoading(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const validateForm = (): boolean => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('All fields are required');
            return false;
        }

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            return false;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return false;
        }

        if (currentPassword === newPassword) {
            setError('New password must be different from current password');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            await onSubmit(currentPassword, newPassword);
            setSuccess(true);
            setError('');

            // Close modal after 1.5 seconds on success
            setTimeout(() => {
                handleClose();
            }, 1500);
        } catch (err: any) {
            setSuccess(false);

            // Handle Firebase auth errors
            if (err.code === 'auth/wrong-password') {
                setError('Current password is incorrect');
            } else if (err.code === 'auth/weak-password') {
                setError('New password is too weak');
            } else if (err.code === 'auth/requires-recent-login') {
                setError('Please sign out and sign in again before changing your password');
            } else {
                setError(err.message || 'Failed to change password. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Change Password">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-neuro-primary mb-2">
                        Current Password
                    </label>
                    <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        disabled={isLoading || success}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-neuro-primary mb-2">
                        New Password
                    </label>
                    <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min 6 characters)"
                        disabled={isLoading || success}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-neuro-primary mb-2">
                        Confirm New Password
                    </label>
                    <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        disabled={isLoading || success}
                    />
                </div>

                {error && (
                    <div className="p-3 rounded-neuro-md bg-neuro-peach/30 text-neuro-primary text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-3 rounded-neuro-md bg-neuro-mint/30 text-neuro-primary text-sm">
                        Password changed successfully!
                    </div>
                )}

                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        isLoading={isLoading}
                        disabled={isLoading || success}
                        className="flex-1"
                    >
                        {success ? 'Success!' : 'Change Password'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
