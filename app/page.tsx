'use client'

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import { Session } from '@supabase/supabase-js'

type Bookmark = {
  id: number
  title: string
  url: string
  created_at: string
  user_id?: string
}

export default function Home() {
  const [session, setSession] = useState<Session | null>(null)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  // 🔐 AUTH STATE
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  // 📥 FETCH BOOKMARKS & REALTIME
  useEffect(() => {
    if (session) {
      fetchBookmarks()
      const unsubscribe = setupRealtime()
      return unsubscribe
    }
  }, [session])

  async function fetchBookmarks() {
    if (!session) return

    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) alert(error.message)
    else setBookmarks(data || [])
  }

  function setupRealtime() {
    if (!session) return () => {}

    const channel = supabase
      .channel('public:bookmarks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${session.user.id}`,
        },
        () => fetchBookmarks()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }

  async function addBookmark() {
    if (!title || !url) {
      alert('Please fill all fields')
      return
    }

    const { error } = await supabase.from('bookmarks').insert([
      {
        title,
        url,
        user_id: session?.user.id,
      },
    ])

    if (error) alert(error.message)
    else {
      setTitle('')
      setUrl('')
      fetchBookmarks()
    }
  }

  async function deleteBookmark(id: number) {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)

    if (error) alert(error.message)
    else fetchBookmarks()
  }

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md sm:max-w-lg">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Smart Bookmark App
        </h1>

        {!session ? (
          <div className="flex justify-center">
            <button
              onClick={loginWithGoogle}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
            >
              Sign in with Google
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6">

        
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
              <p className="text-gray-700 font-medium text-sm sm:text-base break-all">
                Signed in as {session.user.email}
              </p>
              <button
                onClick={logout}
                className="text-red-600 hover:text-red-800 font-semibold text-sm"
              >
                Logout
              </button>
            </div>

            <hr className="my-4 border-gray-200" />

            
            <div className="flex flex-col gap-3 mb-4">

           
              <input
                className={`w-full border border-gray-300 rounded-lg px-3 py-2
                ${title ? 'text-blue-600' : 'text-gray-400'}
                placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:text-blue-700`}
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

            
              <input
                className={`w-full border border-gray-300 rounded-lg px-3 py-2
                ${url ? 'text-blue-600' : 'text-gray-400'}
                placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:text-blue-700`}
                placeholder="URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />

              <button
                onClick={addBookmark}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg shadow transition"
              >
                Add Bookmark
              </button>

            </div>

            <hr className="my-4 border-gray-200" />

          
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
              Saved Bookmarks
            </h2>

            <ul className="flex flex-col gap-3">
              {bookmarks.map((b) => (
                <li
                  key={b.id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all text-sm sm:text-base"
                  >
                    {b.title}
                  </a>
                  <button
                    onClick={() => deleteBookmark(b.id)}
                    className="text-red-600 hover:text-red-800 font-semibold text-sm"
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>

          </div>
        )}
      </div>
    </main>
  )
}
