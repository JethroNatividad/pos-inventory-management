import InputError from "@/Components/input-error";
import { Input } from "@/Components/ui/input";
import { Head, useForm } from "@inertiajs/react";
import { Label } from "@/Components/ui/label";
import { FormEventHandler } from "react";
import { Button } from "@/Components/ui/button";

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("password.email"));
    };

    return (
        <div className="flex items-center justify-center min-h-screen dark:bg-primary bg-primary/5">
            <Head title="Forgot Password" />

            <form
                onSubmit={submit}
                className="border bg-white p-6 rounded-md w-full max-w-sm"
            >
                <div className="space-y-2 mb-4">
                    <h1 className="text-2xl font-medium uppercase">
                        Reset Password
                    </h1>
                    <p className="text-sm">
                        Enter your email to receive a password reset link
                    </p>
                </div>

                {status && (
                    <div className="mb-4 text-sm font-medium text-green-600">
                        {status}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="your@email.com"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                        />
                        <InputError message={errors.email} />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={processing}
                    >
                        Send
                    </Button>
                </div>
            </form>
        </div>
    );
}
