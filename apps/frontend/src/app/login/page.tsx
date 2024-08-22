"use client";
import  Appbar  from "@/components/Appbar";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    
    return <div> 
        <Appbar />
        <div className="flex justify-center">
            <div className="flex pt-8 max-w-4xl">
                <div className="flex-1 pt-20 px-4">
                    <div className="font-semibold text-3xl pb-4">
                    Join millions worldwide who automate their work using Zapier.
                    </div>
                </div>
                <div className="flex-1 pt-6 pb-6 mt-12 px-4 border rounded">
                    <input onChange={e => {
                        setEmail(e.target.value)
                    }}  type="text" placeholder="Your Email"></input>
                    <input onChange={e => {
                        setPassword(e.target.value);
                    }}  type="password" placeholder="Password"></input>
                    <div className="pt-4">
                        <button onClick={async () => {
                            const res = await axios.post(`localhost:5000/api/v1/user/signin`, {
                                username: email,
                                password,
                            });
                            localStorage.setItem("token", res.data.token);
                            router.push("/dashboard");
                        }}>Login</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
}