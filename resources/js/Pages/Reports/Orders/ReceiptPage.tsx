import { Button } from "@/Components/ui/button";
import Layout from "@/Layouts/Layout";
import { Order } from "@/types";
import { ChevronLeft } from "lucide-react";
import React, { useEffect, useRef } from "react";
import Receipt from "./reciept";
import { router, usePage } from "@inertiajs/react";

type Props = {
    order: Order;
};

const ReceiptPage = ({ order }: Props) => {
    const receiptRef = useRef<HTMLDivElement>(null);
    const { previousUrl } = usePage().props;

    useEffect(() => {
        if (previousUrl?.includes("pos")) {
            localStorage.removeItem("orders");
        }
    }, []);

    const handlePrint = () => {
        window.print();
    };

    return (
        <Layout>
            <div className="max-w-md mx-auto space-y-4">
                <div
                    ref={receiptRef}
                    id="receipt-print-area"
                    className="w-full"
                >
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
