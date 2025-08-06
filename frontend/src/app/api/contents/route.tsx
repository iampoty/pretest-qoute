// app/api/contents/route.ts
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    //   const cookieStore = cookies()
    //   const token = cookieStore.get('token')?.value
    const cookieStore = await cookies() // ต้อง await
    const token = cookieStore.get('token')?.value

    const url = new URL(req.url)
    const userId = url.searchParams.get('user_id') || ''

    const res = await fetch(`http://backend/v1/contents?user_id=${userId}`, {
        method: 'GET',
        headers: {
            // Authorization: `Bearer ${token}`,
            'x-api-key': 'Bearer ' + process.env.API_KEY || '',
        },
    })

    //console.log('GET /api/contents', { "API_KEY": process.env.API_KEY, userId, token, res })

    if (!res.ok) {
        return NextResponse.json({ message: 'Failed to fetch content' }, { status: 500 })
    }

    const contents = await res.json()
    return NextResponse.json(contents)
}