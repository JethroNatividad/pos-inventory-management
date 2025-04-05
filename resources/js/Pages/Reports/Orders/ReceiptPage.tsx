import { Button } from "@/Components/ui/button";
import Layout from "@/Layouts/Layout";
import { Order } from "@/types";
import { ChevronLeft } from "lucide-react";
import React, { useRef } from "react";
import Receipt from "./reciept";
import { router, usePage } from "@inertiajs/react";

type Props = {
    order: Order;
};

const ReceiptPage = ({ order }: Props) => {
    const receiptRef = useRef<HTMLDivElement>(null);
    const { previousUrl } = usePage().props;

    const handlePrint = () => {
        if (receiptRef.current) {
            const printContents = receiptRef.current.innerHTML;
            const originalContents = document.body.innerHTML;

            // Create a new style element for print
            const style = document.createElement("style");
            style.innerHTML = `
                @media print {
                    * {
                        font-size: 12px !important;
                    }
                    @page {
                        size: 80mm 200mm;
                        margin: 0;
                    }
                    body {
                        width: 80mm;
                    }
                }
            `;

            document.body.innerHTML = printContents;
            document.head.appendChild(style);
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload(); // Reload to restore the original content
        }
    };

    return (
        <Layout>
            <div className="max-w-md mx-auto space-y-4">
                <div ref={receiptRef} className="w-full">
                    <Receipt order={order} />
                </div>
                <div className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={() => {
                            router.visit(previousUrl ?? "/");
                        }}
                    >
                        <ChevronLeft /> <p>Back</p>
                    </Button>
                    <Button onClick={handlePrint}>Print</Button>
                </div>
            </div>
        </Layout>
    );
};

export default ReceiptPage;
