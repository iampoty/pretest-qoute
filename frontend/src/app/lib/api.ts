export async function createContent(token: string, title: string, author: string) {
  // console.log('createContent.api_key ', process.env.API_KEY)
  // console.log('createContent.token ', token)
  const res = await fetch('http://localhost:8080/v1/content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-API-Key': 'Bearer ' + process.env.NEXT_PUBLIC_API_KEY,
    },
    body: JSON.stringify({ title, author }),
  })
  return await res.json()
}

export async function editContent(token: string, id: string, title: string) {
  // console.log('createContent.api_key ', process.env.API_KEY)
  // console.log('createContent.token ', token)
  const res = await fetch('http://localhost:8080/v1/content/' + id, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-API-Key': 'Bearer ' + process.env.NEXT_PUBLIC_API_KEY,
    },
    body: JSON.stringify({ title }),
  })
  return await res.json()
}

export async function voteContent(token: string, id: string) {
  // console.log('voteContent ', process.env.API_KEY)
  const res = await fetch(`http://localhost:8080/v1/content/${id}/vote`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-API-Key': 'Bearer ' + process.env.NEXT_PUBLIC_API_KEY,
    },
  })

  if (!res.ok) {
    // ถ้าสถานะเป็น Error (เช่น 400, 500) ให้ throw Error พร้อมข้อความ
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to vote');
  }
  
  return await res.json()
}
