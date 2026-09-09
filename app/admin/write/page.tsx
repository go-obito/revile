import WriterClient from "../../writer-client";
import { hasSession } from "@/lib/auth";
import { redirect } from "next/navigation";
export default async function Page(){if(!(await hasSession()))redirect("/sign-in");return <WriterClient/>}
