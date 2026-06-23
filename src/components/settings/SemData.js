import { getSemData } from '@/actions/semester';
import { useUser } from '@/app/Context/UserContext';
import React, { useEffect, useState } from 'react'
import SubjectChild from './SubjectChild';
import UniversalModal from '@/components/ui/UniversalModal';
import { motion } from 'framer-motion';
import { addSubject } from '@/actions/subject';
import Toast from '@/components/ui/Toast';

function SemData() {

    const { selectedSem } = useUser();
    const [subjects, setSubjects] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    
    // Toast State
    const [toastConfig, setToastConfig] = useState({
        isOpen: false,
        title: "",
        description: "",
        type: "success"
    });
    const closeToast = () => setToastConfig(prev => ({ ...prev, isOpen: false }));
    const [addSubjectState, isAddingSubject] = useState({
        name: "",
        code: "",
        credits: 3,
        dayOfWeek: "",
        startTime: "",
        endTime: "",
        room: "",
        teacher: ""
    });
    
    const [isSaving, setIsSaving] = useState(false);

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: "",
        description: "",
        type: "info",
        confirmText: "Confirm",
        confirmDisabled: false,
        onConfirm: () => { }
    });

    const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        if (!selectedSem) return;
        const loadSemData = async () => {
            try {
                const response = await getSemData(selectedSem);

                if (response && response.success && Array.isArray(response.data))
                    setSubjects(response.data);

            } catch (err) {
                console.error("Fetch error:", err);
                setSubjects([]);
            }

        }

        loadSemData();
    }, [selectedSem])

    const refreshData = async () => {
        try {
            const response = await getSemData(selectedSem);
            if (response && response.success && Array.isArray(response.data)) {
                setSubjects(response.data);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }
    }

    const handleAddSubject = async () => {
        if (!addSubjectState.name || !addSubjectState.code) {
            setToastConfig({
                isOpen: true,
                title: "Validation Error",
                description: "Name and Code are required.",
                type: "error"
            });
            return;
        }

        if (addSubjectState.dayOfWeek !== "") {
            if (!addSubjectState.startTime || !addSubjectState.endTime) {
                setToastConfig({
                    isOpen: true,
                    title: "Validation Error",
                    description: "Start Time and End Time are required when scheduling a class.",
                    type: "error"
                });
                return;
            }
            if (addSubjectState.startTime >= addSubjectState.endTime) {
                setToastConfig({
                    isOpen: true,
                    title: "Validation Error",
                    description: "End Time must be after Start Time.",
                    type: "error"
                });
                return;
            }
        }

        try {
            setIsSaving(true);
            const response = await addSubject({
                ...addSubjectState,
                semester: selectedSem
            });

            if (response && response.success) {
                setToastConfig({
                    isOpen: true,
                    title: "Success",
                    description: response.message || "Subject added successfully!",
                    type: "success"
                });

                // Reset form
                isAddingSubject({ 
                    name: "", 
                    code: "", 
                    credits: 3, 
                    dayOfWeek: "", 
                    startTime: "", 
                    endTime: "", 
                    room: "", 
                    teacher: "" 
                });
                setIsOpen(false);
                
                // Refresh data
                await refreshData();
            } else {
                setToastConfig({
                    isOpen: true,
                    title: "Error",
                    description: response?.error || "Failed to add subject.",
                    type: "error"
                });
            }

        } catch (err) {
            setToastConfig({
                isOpen: true,
                title: "Error",
                description: err.message || "Something went wrong.",
                type: "error"
            });
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <>
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

            <Toast 
                isOpen={toastConfig.isOpen}
                onClose={closeToast}
                title={toastConfig.title}
                description={toastConfig.description}
                type={toastConfig.type}
            />

            <div>
                {/* Header */}
                <div className='overflow-hidden'>

                    <div className='flex justify-between items-center w-full p-2 mb-1 '>
                        <h3 className='text-base text-primary font-medium'>Curriculum</h3>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsOpen(!isOpen)}
                            className='px-3 py-2 text-xs text-obsidian bg-primary rounded-lg font-semibold hover:bg-primary/90'>Add Subject
                        </motion.button>
                    </div>

                    <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                        <div className='overflow-hidden'>

                            <div className='border border-primary/10 bg-primary/5 rounded-xl mb-3 overflow-hidden'>
                                {/* Upper deck */}
                                <div className='p-5 grid grid-cols-2 gap-5'>
                                    {/* Subject Name */}
                                    <div className='flex items-start justify-center flex-col'>
                                        <p className='text-secondary text-[10px] mb-0.5'>NAME</p>
                                        <input
                                            value={addSubjectState.name}
                                            onChange={(e) => isAddingSubject(prev => ({ ...prev, name: e.target.value }))}
                                            type="text" placeholder='Subject Name'
                                            className='rounded-lg h-8 border text-xs text-primary border-primary/10 bg-primary/5 focus:ring focus:ring-primary/15 focus:outline-none transition-all duration-200 px-2 py-1 w-full appearance-none'
                                        />
                                    </div>

                                    {/* Subject Code */}
                                    <div className='flex items-start justify-center flex-col'>
                                        <p className='text-secondary text-[10px] mb-0.5'>CODE</p>
                                        <input
                                            value={addSubjectState.code}
                                            onChange={(e) => isAddingSubject(prev => ({ ...prev, code: e.target.value }))}
                                            maxLength={10}
                                            type="text" placeholder='Subject Code (max 10 characters)'
                                            className='rounded-lg h-8 border text-xs text-primary border-primary/10 bg-primary/5 focus:ring focus:ring-primary/15 focus:outline-none transition-all duration-200 px-2 py-1 w-full appearance-none'
                                        />
                                    </div>

                                    {/* Subject Credits */}
                                    <div className='flex items-start justify-center flex-col'>
                                        <p className='text-secondary text-[10px] mb-0.5 uppercase'>Credits</p>
                                        <select
                                            value={addSubjectState.credits}
                                            onChange={(e) => isAddingSubject(prev => ({ ...prev, credits: Number(e.target.value) }))}
                                            className="w-full text-xs pl-3 pr-8 py-1.5 h-8 bg-primary/5 outline outline-primary/10 focus:outline-primary/25 transition duration-200 ease-in-out rounded-lg text-primary appearance-none cursor-pointer"
                                        >
                                            {[1, 2, 3, 4, 5].map((c) => (
                                                <option key={c} value={c} className="bg-obsidian text-secondary">
                                                    {c}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Day of Class */}
                                    <div className='flex items-start justify-center flex-col'>
                                        <p className='text-secondary text-[10px] mb-0.5 uppercase'>Day of Class</p>
                                        <select
                                            value={addSubjectState.dayOfWeek}
                                            onChange={(e) => isAddingSubject(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                                            className="w-full text-xs pl-3 pr-8 py-1.5 h-8 bg-primary/5 outline outline-primary/10 focus:outline-primary/25 transition duration-200 ease-in-out rounded-lg text-primary appearance-none cursor-pointer"
                                        >
                                            <option value="" className="bg-obsidian text-secondary">No Class Scheduled</option>
                                            <option value="1" className="bg-obsidian text-secondary">Monday</option>
                                            <option value="2" className="bg-obsidian text-secondary">Tuesday</option>
                                            <option value="3" className="bg-obsidian text-secondary">Wednesday</option>
                                            <option value="4" className="bg-obsidian text-secondary">Thursday</option>
                                            <option value="5" className="bg-obsidian text-secondary">Friday</option>
                                            <option value="6" className="bg-obsidian text-secondary">Saturday</option>
                                            <option value="0" className="bg-obsidian text-secondary">Sunday</option>
                                        </select>
                                    </div>

                                    {/* Start Time */}
                                    <div className='flex items-start justify-center flex-col'>
                                        <p className='text-secondary text-[10px] mb-0.5 uppercase'>Start Time</p>
                                        <input
                                            value={addSubjectState.startTime}
                                            onChange={(e) => isAddingSubject(prev => ({ ...prev, startTime: e.target.value }))}
                                            type="time"
                                            disabled={addSubjectState.dayOfWeek === ""}
                                            className={`rounded-lg h-8 border text-xs border-primary/10 bg-primary/5 focus:ring focus:ring-primary/15 focus:outline-none transition-all duration-200 px-2 py-1 w-full appearance-none disabled:opacity-40 disabled:cursor-not-allowed ${
                                                addSubjectState.startTime ? 'text-primary' : 'text-primary/30'
                                            }`}
                                        />
                                    </div>

                                    {/* End Time */}
                                    <div className='flex items-start justify-center flex-col'>
                                        <p className='text-secondary text-[10px] mb-0.5 uppercase'>End Time</p>
                                        <input
                                            value={addSubjectState.endTime}
                                            onChange={(e) => isAddingSubject(prev => ({ ...prev, endTime: e.target.value }))}
                                            type="time"
                                            disabled={addSubjectState.dayOfWeek === ""}
                                            className={`rounded-lg h-8 border text-xs border-primary/10 bg-primary/5 focus:ring focus:ring-primary/15 focus:outline-none transition-all duration-200 px-2 py-1 w-full appearance-none disabled:opacity-40 disabled:cursor-not-allowed ${
                                                addSubjectState.endTime ? 'text-primary' : 'text-primary/30'
                                            }`}
                                        />
                                    </div>

                                    {/* Room */}
                                    <div className='flex items-start justify-center flex-col'>
                                        <p className='text-secondary text-[10px] mb-0.5 uppercase'>Room / Location</p>
                                        <input
                                            value={addSubjectState.room}
                                            onChange={(e) => isAddingSubject(prev => ({ ...prev, room: e.target.value }))}
                                            type="text" placeholder={addSubjectState.dayOfWeek === "" ? "Select a day first" : "e.g., Room 302, Lab A"}
                                            disabled={addSubjectState.dayOfWeek === ""}
                                            className='rounded-lg h-8 border text-xs text-primary border-primary/10 bg-primary/5 focus:ring focus:ring-primary/15 focus:outline-none transition-all duration-200 px-2 py-1 w-full appearance-none disabled:opacity-40 disabled:cursor-not-allowed'
                                        />
                                    </div>

                                    {/* Instructor */}
                                    <div className='flex items-start justify-center flex-col'>
                                        <p className='text-secondary text-[10px] mb-0.5 uppercase'>Instructor / Teacher</p>
                                        <input
                                            value={addSubjectState.teacher}
                                            onChange={(e) => isAddingSubject(prev => ({ ...prev, teacher: e.target.value }))}
                                            type="text" placeholder={addSubjectState.dayOfWeek === "" ? "Select a day first" : "Instructor Name"}
                                            disabled={addSubjectState.dayOfWeek === ""}
                                            className='rounded-lg h-8 border text-xs text-primary border-primary/10 bg-primary/5 focus:ring focus:ring-primary/15 focus:outline-none transition-all duration-200 px-2 py-1 w-full appearance-none disabled:opacity-40 disabled:cursor-not-allowed'
                                        />
                                    </div>
                                </div>

                                {/* Lower deck */}
                                <div className='bg-primary/5 border-t border-t-primary/10 px-4 py-2 flex justify-end items-center'>
                                    <div className='flex items-center gap-4'>
                                        <span onClick={() => setIsOpen(false)} className='text-secondary hover:text-primary/90 transition-colors text-xs font-medium cursor-pointer'>Cancel</span>
                                        <motion.button
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleAddSubject}
                                            disabled={isSaving}
                                            className={`px-3 py-2 text-xs text-obsidian transition-colors rounded-lg font-semibold ${isSaving ? "bg-primary/50" : "bg-primary hover:bg-primary/90"}`}>{isSaving ? "Saving..." : "Save Subject"}
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subjects List */}
                <div className='space-y-3'>
                    {subjects.map((sub) => (
                        <div key={sub.id}>
                            <SubjectChild subject={sub} setModalConfig={setModalConfig} setToastConfig={setToastConfig} refreshData={refreshData} />
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default SemData