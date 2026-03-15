import { motion } from 'framer-motion'
import React, { useState } from 'react'
import UniversalModal from '../ui/UniversalModal'
import deleteAccount from '@/actions/user';
import { signOut } from 'next-auth/react';

function AccountDelete() {

    const [isDeleting, setIsDeleting] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: "",
        description: "",
        type: "info",
        confirmText: "Confirm",
        confirmDisabled: false,
        onConfirm: () => { }
    })

    const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }))

    const triggerDeleteAccount = () => {
        setModalConfig({
            isOpen: true,
            title: "Delete Account",
            description: "Are you sure you want to delete this account? This action cannot be undone and deletes all its data.",
            type: "confirm",
            confirmText: "Delete",
            confirmDisabled: false,
            onConfirm: () => handleDeleteAccount()
        })
    }

    const handleDeleteAccount = async () => {
        try {
            setIsDeleting(true);

            const response = await deleteAccount();

            if(response && response.success){
                setModalConfig({
                    isOpen: true,
                    title: "Success",
                    description: response?.message || "Account Deleted Successfully",
                    type: "success"
                })

                setTimeout(async () => {
                    setModalConfig({isOpen: false});

                    await signOut({ callbackUrl: "/login" })
                }, 1000);
            }
            else{
                setModalConfig({
                    isOpen: true,
                    title: "Error",
                    description: response?.error || "Failed to save marks.",
                    type: "error"
                });

                setIsDeleting(false)
            }

        } catch (error) {

        }
    }

    return (
        <div>
            <UniversalModal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                title={modalConfig.title}
                description={modalConfig.description}
                type={modalConfig.type}
                confirmText={modalConfig.confirmText}
                confirmDisabled={modalConfig.confirmDisabled}
                onConfirm={modalConfig.onConfirm}
            />

            <div className='border border-danger/30 rounded-xl bg-danger/5 mt-2'>
                {/* Upper container */}
                <div className='p-5 flex flex-col items-start justify-center gap-2 pb-16 '>
                    <h2 className='text-lg text-danger'>Delete Account</h2>
                    <p className='text-sm text-secondary'>Permanently remove your account and all of your data from the platform. This action is not reversible.</p>
                </div>
                {/* Lower container */}
                <div className='bg-danger/8 flex justify-end px-4 py-3 items-center border-t border-t-danger/30'>
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={triggerDeleteAccount}
                        disabled={isDeleting}
                        className='px-3 py-2 rounded-lg text-primary font-semibold text-sm bg-danger cursor-pointer hover:bg-danger/90 transition-colors'
                    >
                        {isDeleting ? "Deleting Account..." : "Delete Account"}
                    </motion.button>
                </div>
            </div>
        </div>
    )
}

export default AccountDelete