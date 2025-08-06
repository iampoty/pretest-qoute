export async function register({ username, email, name, password }: { username: string; email: string, name: string, password: string }) {
  const res = await fetch('http://localhost:8080/v1/user/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': 'Bearer ' + process.env.NEXT_PUBLIC_API_KEY },    
    body: JSON.stringify({ username, password, email, name }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Invalid credentials')
  }

  const data = await res.json()
}

export async function login({ username, password }: { username: string; password: string }) {
  // console.log('voteContent ', process.env.NEXT_PUBLIC_API_KEY)
  const res = await fetch('http://localhost:8080/v1/user/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': 'Bearer ' + process.env.NEXT_PUBLIC_API_KEY },    
    body: JSON.stringify({ username, password }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Invalid credentials')
  }

  const data = await res.json()

  // setUser({ username: res.username })
  // setToken(res.token)

  return {
    id:data.user.id,
    name:data.user.name,
    username:data.user.username,
    token: data.token,
  }
}
