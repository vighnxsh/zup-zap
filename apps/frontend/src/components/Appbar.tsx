import React from 'react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
function Appbar() {
    return (
        <div className='flex border-p justify-between'>
            <div>
                Zup-Zapp
            </div>
            <div>
                Contact Sales
            </div>
            <Button> <Link href='/login'>Login</Link></Button>


        </div>
    )
}

export default Appbar
