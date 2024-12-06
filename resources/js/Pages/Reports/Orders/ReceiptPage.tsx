import { Button } from "@/Components/ui/button";
import Layout from "@/Layouts/Layout";
import { Order } from "@/types";
import { ChevronLeft } from "lucide-react";
import React, { useRef } from "react";
import Receipt from "./reciept";

type Props = {
    order: Order;
};

const ReceiptPage = ({ order }: Props) => {
    const receiptRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        if (receiptRef.current) {
            const printContents = receiptRef.current.innerHTML;
            const originalContents = document.body.innerHTML;

            document.body.innerHTML = printContents;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload(); // Reload to restore the original content
        }
    };

    return (
        <Layout>
            <div className="max-w-md mx-auto space-y-4">
                <div ref={receiptRef}>
                    <Receipt order={order} />
                </div>
                <div className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={() => window.history.back()}
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
