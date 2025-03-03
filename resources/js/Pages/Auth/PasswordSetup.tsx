import InputError from "@/Components/input-error";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Head, useForm } from "@inertiajs/react";
import { FormEventHandler, useState } from "react";

export default function PasswordSetup() {
    const [showForm, setShowForm] = useState(false);
    const { data, setData, put, processing, errors, reset } = useForm({
        password: "",
        password_confirmation: "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(route("password.update"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <div className="flex items-center justify-center min-h-screen dark:bg-primary bg-primary/5">
            <Head title="Set Password" />

            {!showForm ? (
                <div className="border bg-white p-6 rounded-md w-full max-w-sm space-y-4">
                    <h1 className="text-2xl font-medium">Welcome!</h1>
                    <p className="text-gray-600">
                        Before you begin, you'll need to set up a password for
                        your account. This will help ensure the security of your
                        account.
                    </p>
                    <div className="pt-2">
                        <Button
                            className="w-full"
                            onClick={() => setShowForm(true)}
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            ) : (
                <form
                    onSubmit={submit}
                    className="border bg-white p-6 rounded-md w-full max-w-sm"
                >
                    <div className="space-y-2 mb-4">
                        <h1 className="text-2xl font-medium uppercase">
                            Set Password
                        </h1>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                placeholder="********"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">
                                Confirm New Password
                            </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        "password_confirmation",
                                        e.target.value
                                    )
                                }
                                placeholder="********"
                            />
                            <InputError
                                message={errors.password_confirmation}
                            />
                        </div>
                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                Set Password
                            </Button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}
