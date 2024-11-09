import InputError from "@/Components/input-error";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import Layout from "@/Layouts/Layout";
import { Role } from "@/types";
import { Link, useForm } from "@inertiajs/react";
import { ChevronLeft } from "lucide-react";

type Props = {
    roles: Role[];
};

const Create = ({ roles }: Props) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        role: roles[0].name,
    });

    return (
        <Layout>
            <form className="max-w-md w-full mx-auto space-y-4">
                <div className="flex items-center space-x-2">
                    <Button size="icon" variant="outline" asChild>
                        <Link href={route("users.index")}>
                            <ChevronLeft />
                        </Link>
                    </Button>
                    <h1 className="text-xl font-medium">Create User</h1>
                </div>

                <div className="space-y-4 rounded-md p-4 border">
                    <div className="space-y-2">
                        <Label htmlFor="first_name">First Name</Label>
                        <Input
                            id="first_name"
                            type="text"
                            name="first_name"
                            value={data.first_name}
                            onChange={(e) =>
                                setData("first_name", e.target.value)
                            }
                            placeholder="Juan"
                        />
                        <InputError message={errors.first_name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="middle_name">
                            Middle Name (Optional)
                        </Label>
                        <Input
                            id="middle_name"
                            type="text"
                            name="middle_name"
                            value={data.middle_name}
                            onChange={(e) =>
                                setData("middle_name", e.target.value)
                            }
                            placeholder="Dela"
                        />
                        <InputError message={errors.middle_name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                            id="last_name"
                            type="text"
                            name="last_name"
                            value={data.last_name}
                            onChange={(e) =>
                                setData("last_name", e.target.value)
                            }
                            placeholder="Cruz"
                        />
                        <InputError message={errors.last_name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            placeholder="your@email.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="roleId">Role</Label>
                        <Select
                            onValueChange={(value) => setData("role", value)}
                            value={data.role}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem
                                        key={role.name}
                                        value={role.name}
                                    >
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.role} />
                    </div>

                    <div className="flex justify-end">
                        <Button asChild>
                            <Link href={route("users.index")}>Create User</Link>
                        </Button>
                    </div>
                </div>
            </form>
        </Layout>
    );
};

export default Create;
