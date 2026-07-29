"use client";
import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

export default function DownloadPDFButton({ fileName = "Vidyavriksha_Marksheet.pdf" }) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownloadPDF = async () => {
        const element = document.getElementById("official-marksheet-document");
        if (!element) {
            alert("Unable to locate mark sheet element.");
            return;
        }

        try {
            setIsGenerating(true);
            
            // Temporarily make element visible for high-res canvas rendering
            element.classList.remove("hidden");

            const canvas = await html2canvas(element, {
                scale: 2, // High resolution (2x retina)
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff"
            });

            // Re-hide element in screen view if needed (print CSS handles print view)
            element.classList.add("hidden");

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(fileName);
        } catch (error) {
            console.error("PDF generation failed:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white font-medium hover:bg-brand/90 transition-all text-xs shadow-lg shadow-brand/20 cursor-pointer disabled:opacity-50"
        >
            {isGenerating ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Generating PDF...
                </>
            ) : (
                <>
                    <Download className="w-4 h-4" /> Download PDF Marksheet
                </>
            )}
        </button>
    );
}
