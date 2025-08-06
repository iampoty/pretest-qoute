'use client';
import { useEffect, useState, useContext } from 'react';
import LoginModal from './components/LoginModal'
import CreateModal from './components/CreateModal'
import EditModal from './components/EditModal'
import { voteContent } from './lib/api'
// import LogoutButton from './components/LogoutButton'
import { useAuth } from './contexts/AuthContext'
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export interface Content {
    vote: number;
    id: string;
    title: string;
    author: string;
    user_id: string;
    created_at: string;
    can_vote: boolean;
    can_edit: boolean;
    can_delete: boolean;
}

type User = {
    id: string;
    username: string;
    name: string;
    token: string;
};


export default function ContentListPage() {
    const [contents, setContents] = useState<Content[]>([]);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState('');
    const [filterUser, setFilterUser] = useState('');
    const [page, setPage] = useState(1);
    const [next, setNext] = useState(0);
    const [total, setTotal] = useState(0);
    // const [last, setLast] = useState('');
    const [sort, setSort] = useState('lastes');
    const [activetab, setActiveTab] = useState('recent');
    const [loadmore, setLoadmore] = useState(true);

    // const [user, setUser] = useState<User | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editId, setEditId] = useState('');
    const { user, token, logout } = useAuth()

    const [init, setInit] = useState(false)

    const handleLogout = () => {
        // console.log('handleLogout')
        const newSort = "lastes";
        setPage(1);
        setSort(newSort)
        setContents([]);
        setFilterUser('')
        setActiveTab('recent')
        logout()
        //fetchContents();
    }

    const handleCreateClick = () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        // logic สร้างโพสต์ใหม่...
        // alert('Create Post');
        setShowCreateModal(true)
    };

    const handleEditClick = (id: string) => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        // logic สร้างโพสต์ใหม่...
        // alert('Create Post');

        setEditId(id)
        setShowEditModal(true)
    };

    const handleVoteClick = async (id: string) => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        // logic โหวต...
        try {
            const resp = await voteContent(token?token:'', id)
            // console.log('VoteClick.resp', resp)        
            alert('โหวดสำเร็จ');
        } catch (error) {
            // console.log('VoteClick.error', error)        
            alert('ไม่สามารถโหวดได้.');
        }
    };

    async function fetchContents() {
        setLoading(true);

        // console.log('user', user)
        // console.log('token', token)
        // console.log('user.token', user?.token)

        const res = await fetch(`http://localhost:8080/v1/content?title=${query}&page=${page}&sort=${sort}`+(filterUser?'&user_id='+filterUser:''),
            {
                cache: 'no-store',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'Bearer ' + process.env.NEXT_PUBLIC_API_KEY || '',
                    Authorization: `Bearer ` + token,
                }
            }
        );
        const { data, total: _total, lastid: _last, next: _next } = await res.json();
        // console.log('_total', _total)
        // console.log('_last', _last)
        // console.log('data', data)
        // console.log('data.length', data.length)
        // if (_last == '') {
        //     setLoadmore(false)
        // } else {
        //     setLoadmore(true)
        // }
        if (_next == 0) {
            setLoadmore(false)
        } else {
            setLoadmore(true)
        }
        setContents((prev) => [...prev, ...data]);
        setLoading(false);
        setTotal(_total)
        setNext(_next)
        // setLast(_last)
        // setPage(_next)
    }

    useEffect(() => {
        // console.log('do update rule init:',init)  
        // console.log('do update rule loading:',loading)  
        // console.log('do update rule user:',user)  
        // console.log('do update rule contents:',contents)
        if( user && contents && !loading && !init){
            console.log("Do Init Content")
            const updatedData = contents.map((item: Content) => {
                // เช็คว่า user_id ของโพสต์ตรงกับ user.id หรือไม่
                // if (user && item.user_id === user.id) {
                    // ถ้าตรง ให้สร้าง object ใหม่พร้อมกับแก้ไขฟิลด์
                    // console.log('do update rule user.id:',user.id,' item.user_id:',item.user_id)
                    // return {
                //         ...item,
                //         can_edit: true,
                //         can_delete: true,
                //     };
                // }
                return{
                    ...item,
                    can_edit: (user && item.user_id === user.id),
                    can_delete: (user && item.user_id === user.id)
                }
                // ถ้าไม่ตรง ให้คืนค่า item เดิม
                return item;
            });
            setContents(updatedData);
            setInit(true);
        }


    }, [user, loading]);

    useEffect(() => {
        // if (loadingUser) {
            // console.log('loadingUser(TRUE):',loadingUser)
            // return;
        // }
        // console.log('loadingUser(FALSE):',loadingUser)
        // fetchContents();
        setTimeout(fetchContents,50)
    }, [page, sort]);
    // }, [page, sort, loadingUser]);

    return (
        <div className="p-0">

            <header>
                <nav className="bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800">
                    <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
                        <a href="https://flowbite.com" className="flex items-center">
                            {/* <img src="https://flowbite.com/docs/images/logo.svg" className="mr-3 h-6 sm:h-9" alt="Flowbite Logo" /> */}
                            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Qoute</span>
                        </a>
                        <div className="flex items-center lg:order-2">
                            {user ? (
                                <>
                                    Hello, {user.name} &nbsp;
                                    <a href="#" onClick={handleLogout}>logout</a>
                                    {/* <LogoutButton /> */}

                                </>
                            ) : (
                                <>
                                    <a href="#"
                                        onClick={(e) => setShowLoginModal(true)}
                                        className="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800">Log in</a>
                                    {/* <a href="#" className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">Get started</a>                 */}
                                </>
                            )}
                        </div>
                        {/* <div className="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1" id="mobile-menu-2">
                <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
                    <li>
                        <a href="#" className="block py-2 pr-4 pl-3 text-white rounded bg-primary-700 lg:bg-transparent lg:text-primary-700 lg:p-0 dark:text-white" aria-current="page">Home</a>
                    </li>
                    <li>
                        <a href="#" className="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Company</a>
                    </li>
                    <li>
                        <a href="#" className="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Marketplace</a>
                    </li>
                    <li>
                        <a href="#" className="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Features</a>
                    </li>
                    <li>
                        <a href="#" className="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Team</a>
                    </li>
                    <li>
                        <a href="#" className="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Contact</a>
                    </li>
                </ul>
            </div> */}
                    </div>
                </nav>
            </header>

            <section className="bg-white py-8 antialiased __dark:bg-gray-900 md:py-16">
                <div className="mx-auto max-w-screen-lg px-4 2xl:px-0">
                    <div className="lg:flex lg:items-center lg:justify-between lg:gap-4">

                        <h2 className="shrink-0 text-4xl font-semibold text-gray-900 __dark:text-white sm:text-3xl">คำคม/คำกวนๆ ({total})</h2>

                        {/* <form className="mt-4 w-full gap-4 sm:flex sm:items-center sm:justify-end lg:mt-0"> */}
                        <label htmlFor="simple-search" className="sr-only">Search</label>
                        <div className="relative w-full flex-1 lg:max-w-sm">
                            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
                                <svg className="h-4 w-4 text-gray-500 __dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" strokeLinecap="round" strokeWidth="2"
                                        d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                                </svg>
                            </div>
                            <input type="text" id="simple-search"
                                className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 ps-9 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 __dark:border-gray-600 __dark:bg-gray-700 __dark:text-white __dark:placeholder:text-gray-400 __dark:focus:border-primary-500 __dark:focus:ring-primary-500"
                                placeholder="ค้นหาคำคม / Search Qoute" required
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        if (query.length == 0) {
                                            return
                                        }
                                        const lastPage = page
                                        const lastSort = sort
                                        const lastQuery = query
                                        console.log('setQuery.lastSort', lastSort)
                                        console.log('setQuery.sort', sort)
                                        console.log('setQuery.lastPage', lastPage)
                                        console.log('setQuery.page', page)
                                        console.log('setQuery.lastQuery', lastQuery)
                                        console.log('setQuery.query', query)
                                        // if(sort=='lastes'&&page==1){
                                            // setTimeout(fetchContents,1000)
                                        // }
                                        setSort("lastes");
                                        setPage(1);
                                        setActiveTab('recent')
                                        setContents([]);
                                        // fetchContents();
                                    }
                                }}
                            />
                        </div>

                        {/* <button type="button" data-modal-target="question-modal" data-modal-toggle="question-modal"
                            className="mt-4 w-full shrink-0 rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 __dark:bg-primary-600 __dark:hover:bg-primary-700 __dark:focus:ring-primary-800 sm:mt-0 sm:w-auto">Ask a question</button> */}
                        {/* </form> */}

                        <button
                            onClick={handleCreateClick}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >Create</button>
                    </div>

                    <div>

                        <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 _dark:text-gray-400 _dark:border-gray-700">
                            <ul className="flex flex-wrap -mb-px">
                                <li className="me-2">
                                    <a href="#"
                                        onClick={(e) => {
                                            const newSort = "lastes";
                                            // setLast("");
                                            setPage(1);
                                            setSort(newSort)
                                            setContents([]);
                                            setFilterUser('')
                                            setQuery('')
                                            setActiveTab('recent')
                                            if (page == 1 && newSort == sort) {
                                                setTimeout(fetchContents,50)
                                            }
                                        }}
                                        className={activetab == 'recent'? "inline-block p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active _dark:text-blue-500 _dark:border-blue-500" : "inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 _dark:hover:text-gray-300"}>Recent</a>
                                </li>
                                <li className="me-2">
                                    <a href="#"
                                        onClick={() => {
                                            const newSort = "vote";
                                            // setLast("");
                                            setPage(1);
                                            setSort(newSort)
                                            setContents([]);
                                            setFilterUser('')
                                            setQuery('')
                                            setActiveTab('popular')
                                            if (page == 1 && newSort == sort) {
                                                // fetchContents();
                                                setTimeout(fetchContents,50)
                                            }
                                        }}
                                        className={activetab == 'popular'? "inline-block p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active _dark:text-blue-500 _dark:border-blue-500" : "inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 _dark:hover:text-gray-300"}>Popular</a>
                                </li>
                                {user ? (
                                <li className="me-2">
                                    <a href="#"
                                        onClick={() => {
                                            const newSort = "";
                                            // setLast("");
                                            setPage(1);
                                            setSort(newSort)
                                            setContents([]);
                                            setActiveTab('my')
                                            setQuery('')
                                            setFilterUser(user?user.id:'')
                                            if (page == 1 && newSort == sort) {
                                                // fetchContents();
                                                setTimeout(fetchContents,50)
                                            }
                                        }}
                                        className={activetab == 'my' ? "inline-block p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active _dark:text-blue-500 _dark:border-blue-500" : "inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 _dark:hover:text-gray-300"}>My</a>
                                </li>
                                ):(
                                    <></>
                                )}
                                {/* <li>
            <a className="inline-block p-4 text-gray-400 rounded-t-lg cursor-not-allowed _dark:text-gray-500">Disabled</a>
        </li> */}
                            </ul>
                        </div>

                    </div>

                    <div className="mt-6 flow-root">
                        <div className="-my-6 divide-y divide-gray-200 __dark:divide-gray-800">
                            {contents.map((c) => (
                                <div key={c.id} className="py-6 md:py-8 flex flex-col space-y-4"> {/* เพิ่ม flex-col และ space-y-4 */}
                                    <div className="flex justify-between items-start">
                                        {/* ส่วนของหัวข้อและ Vote count */}
                                        <div className="flex-1"> {/* แก้ไขตรงนี้ */}
                                            <div className="mb-2"> {/* เพิ่ม div ครอบ Vote count */}
                                                <span className="inline-block rounded bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 __dark:bg-green-900 __dark:text-green-300 md:mb-0">
                                                    {c.vote} vote
                                                </span>
                                            </div>
                                            <a href="#" className="text-3xl font-semibold text-gray-900 hover:underline __dark:text-white">“{c.title}”</a>
                                        </div>
                                        {/* ปุ่ม Vote อยู่ทางขวา */}
                                        {/* <button type="button" className="inline-block rounded text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm py-2.5 px-5 text-center ">
                                            Vote
                                        </button> */}

                                        {/* <button 
                                        disabled={true}
                                        type="button" className="inline-block rounded text-white bg-blue-400 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm py-2.2 text-center ">
                                            <svg className="w-6 h-6 text-gray-800 _dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11c.889-.086 1.416-.543 2.156-1.057a22.323 22.323 0 0 0 3.958-5.084 1.6 1.6 0 0 1 .582-.628 1.549 1.549 0 0 1 1.466-.087c.205.095.388.233.537.406a1.64 1.64 0 0 1 .384 1.279l-1.388 4.114M7 11H4v6.5A1.5 1.5 0 0 0 5.5 19v0A1.5 1.5 0 0 0 7 17.5V11Zm6.5-1h4.915c.286 0 .372.014.626.15.254.135.472.332.637.572a1.874 1.874 0 0 1 .215 1.673l-2.098 6.4C17.538 19.52 17.368 20 16.12 20c-2.303 0-4.79-.943-6.67-1.475" />
                                            </svg></button> */}
                                        <button
                                            onClick={() => handleVoteClick(c.id)}
                                            disabled={!c.can_vote} // ถ้า canVote เป็น false ปุ่มจะ disabled
                                            type="button"
                                            className={`inline-block rounded text-white font-medium rounded-lg text-sm py-2.2 text-center 
        ${c.can_vote ? 'bg-blue-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 cursor-pointer' : 'bg-gray-100'}`}
                                        >
                                            <svg className="w-6 h-6 text-gray-200 _dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11c.889-.086 1.416-.543 2.156-1.057a22.323 22.323 0 0 0 3.958-5.084 1.6 1.6 0 0 1 .582-.628 1.549 1.549 0 0 1 1.466-.087c.205.095.388.233.537.406a1.64 1.64 0 0 1 .384 1.279l-1.388 4.114M7 11H4v6.5A1.5 1.5 0 0 0 5.5 19v0A1.5 1.5 0 0 0 7 17.5V11Zm6.5-1h4.915c.286 0 .372.014.626.15.254.135.472.332.637.572a1.874 1.874 0 0 1 .215 1.673l-2.098 6.4C17.538 19.52 17.368 20 16.12 20c-2.303 0-4.79-.943-6.67-1.475" />
                                            </svg></button>

                                        &nbsp;

                                        <button
                                            onClick={() => handleEditClick(c.id)}
                                            disabled={!c.can_edit} // ถ้า canVote เป็น false ปุ่มจะ disabled
                                            type="button"
                                            className={`inline-block rounded text-white font-medium rounded-lg text-sm py-2.2 text-center 
        ${c.can_edit ? 'bg-blue-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 cursor-pointer' : 'bg-gray-100'}`}
                                        >
                                            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z" />
                                            </svg>
                                        </button>


                                    </div>

                                    {/* ส่วนของข้อมูลผู้เขียน */}
                                    <p className="text-sm font-medium text-gray-500 __dark:text-gray-400">
                                        {dayjs(c.created_at).fromNow()} &nbsp;
                                        <a href="#" className="text-gray-900 hover:underline __dark:text-white">{c.author ? c.author : c.user_id}</a>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>


                    <div className="mt-6 flex items-center justify-center lg:justify-start">
                        <button type="button"
                            onClick={() => {
                                // console.log('view more > next', next)
                                setPage(next)
                                // fetchContents()
                            }}

                            className={`${!loadmore ? "hidden" : ""} w-full rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 __dark:border-gray-600 __dark:bg-gray-800 __dark:text-gray-400 __dark:hover:bg-gray-700 __dark:hover:text-white __dark:focus:ring-gray-700 sm:w-auto`}>View more qoute</button>
                    </div>
                </div>
            </section>

            <div id="question-modal" tabIndex={-1} aria-hidden="true"
                className="fixed left-0 right-0 top-0 z-50 hidden h-[calc(100%-1rem)] max-h-full w-full items-center justify-center overflow-y-auto overflow-x-hidden antialiased antialiased md:inset-0">
                <div className="relative max-h-full w-full max-w-xl p-4">
                    {/*<!-- Modal content -->*/}
                    <div className="relative rounded-lg bg-white shadow __dark:bg-gray-800">
                        {/*<!-- Modal header -->*/}
                        <div className="flex items-center justify-between rounded-t border-b border-gray-200 p-4 __dark:border-gray-700 md:p-5">
                            <h3 className="text-lg font-semibold text-gray-900 __dark:text-white">Ask a question</h3>
                            <button type="button"
                                className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 __dark:hover:bg-gray-600 __dark:hover:text-white"
                                data-modal-toggle="question-modal">
                                <svg className="h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        {/*<!-- Modal body --> */}
                        <form className="p-4 md:p-5">
                            <div className="mb-4 grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label htmlFor="question" className="mb-2 block text-sm font-medium text-gray-900 __dark:text-white">Your question
                                        <span className="text-gray-500 __dark:text-gray-400">(150-1000 characters)</span></label>
                                    <textarea id="question" rows={6}
                                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 __dark:border-gray-600 __dark:bg-gray-700 __dark:text-white __dark:placeholder:text-gray-400 __dark:focus:border-primary-500 __dark:focus:ring-primary-500"
                                        required={false}></textarea>
                                </div>
                                <div className="col-span-2 grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="question-type"
                                            className="mb-2 flex items-center text-sm font-medium text-gray-900 __dark:text-white">
                                            <span className="me-1">Question type</span>
                                            <button type="button" data-tooltip-target="tooltip-dark" data-tooltip-style="dark" className="ml-1">
                                                <svg aria-hidden="true"
                                                    className="h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-900 __dark:text-gray-500 __dark:hover:text-white"
                                                    fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd"
                                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                                                        clipRule="evenodd"></path>
                                                </svg>
                                                <span className="sr-only">Details</span>
                                            </button>
                                            <div id="tooltip-dark" role="tooltip"
                                                className="tooltip invisible absolute z-10 inline-block max-w-sm rounded-lg bg-gray-900 px-3 py-2 text-xs font-normal text-white opacity-0 shadow-sm __dark:bg-gray-700">
                                                Choose your question type to get a faster answer.
                                                <div className="tooltip-arrow" data-popper-arrow></div>
                                            </div>
                                        </label>
                                        <select id="question-type"
                                            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 __dark:border-gray-600 __dark:bg-gray-700 __dark:text-white __dark:placeholder:text-gray-400 __dark:focus:border-blue-500 __dark:focus:ring-blue-500">
                                            <option value="technical">Technical Question</option>
                                            <option value="shipment">Shipment Question</option>
                                            <option value="payment">Payment Issue</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="priority-type"
                                            className="mb-2 block text-sm font-medium text-gray-900 __dark:text-white">Priority</label>
                                        <select id="priority-type"
                                            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 __dark:border-gray-600 __dark:bg-gray-700 __dark:text-white __dark:placeholder:text-gray-400 __dark:focus:border-blue-500 __dark:focus:ring-blue-500">
                                            <option value="very-high">Very High</option>
                                            <option value="high">High</option>
                                            <option value="medium">Medium</option>
                                            <option value="low">Low</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <p className="mb-2 block text-sm font-medium text-gray-900 __dark:text-white">Upload files <span
                                        className="text-gray-500 __dark:text-gray-400">(Optional)</span></p>
                                    <div className="flex w-full items-center justify-center">
                                        <label htmlFor="dropzone-file"
                                            className="__dark:hover:bg-bray-800 flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 __dark:border-gray-600 __dark:bg-gray-700 __dark:hover:border-gray-500 __dark:hover:bg-gray-600">
                                            <div className="flex flex-col items-center justify-center pb-6 pt-5">
                                                <svg className="mb-4 h-8 w-8 text-gray-500 __dark:text-gray-400" aria-hidden="true"
                                                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                                </svg>
                                                <p className="mb-2 text-sm text-gray-500 __dark:text-gray-400"><span className="font-semibold">Click to
                                                    upload</span> or drag and drop</p>
                                                <p className="text-xs text-gray-500 __dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                                            </div>
                                            <input id="dropzone-file" type="file" className="hidden" />
                                        </label>
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <div className="flex items-center">
                                        <input id="link-checkbox" type="checkbox" value=""
                                            className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 __dark:border-gray-600 __dark:bg-gray-700 __dark:ring-offset-gray-800 __dark:focus:ring-primary-600" />
                                        <label htmlFor="link-checkbox" className="ms-2 text-sm font-medium text-gray-500 __dark:text-gray-400">I have read
                                            and agree with the <a href="#" className="text-primary-600 hover:underline __dark:text-primary-500">terms and
                                                conditions</a>.</label>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 pt-4 __dark:border-gray-700 md:pt-5">
                                <button type="submit"
                                    className="me-2 inline-flex items-center rounded-lg bg-primary-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 __dark:bg-primary-600 __dark:hover:bg-primary-700 __dark:focus:ring-primary-800">Submit
                                    question</button>
                                <button type="button" data-modal-toggle="question-modal"
                                    className="me-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 __dark:border-gray-600 __dark:bg-gray-800 __dark:text-gray-400 __dark:hover:bg-gray-700 __dark:hover:text-white __dark:focus:ring-gray-700">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/*
            <h1 className="text-2xl font-bold mb-4">Content List</h1>
            <input
                className="border p-2 mb-4 w-full"
                placeholder="Search by title..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        setPage(1);
                        setContents([]);
                        fetchContents();
                    }
                }}
            />
            <table className="table-auto w-full mb-4">
                <thead>
                    <tr>
                        <th className="border px-4 py-2">ID</th>
                        <th className="border px-4 py-2">Title</th>
                        <th className="border px-4 py-2">User</th>
                        <th className="border px-4 py-2">Created At</th>
                    </tr>
                </thead>
                <tbody>
                    {contents.map((c) => (
                        <tr key={c.id}>
                            <td className="border px-4 py-2">{c.id}</td>
                            <td className="border px-4 py-2">{c.title}</td>
                            <td className="border px-4 py-2">{c.user_id}</td>
                            <td className="border px-4 py-2">{new Date(c.created_at).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <button className="bg-gray-200 px-4 py-2 rounded" onClick={() => setPage((p) => p + 1)}>
                    Load More
                </button>
            )}
            */}

            {/* {showLoginModal && <LoginModal onLogin={handleLogin} onClose={() => setShowLoginModal(false)} />} */}
            {showLoginModal && <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />}
            {showCreateModal && <CreateModal contents={contents} setContents={setContents} isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />}
            {showEditModal && <EditModal id={editId} contents={contents} setContents={setContents} isOpen={showEditModal} onClose={() => setShowEditModal(false)} />}
        </div>

    );
}


// function LoginModal({ onLogin, onClose }: { onLogin: (user: any) => void; onClose: () => void }) {
//   const [username, setUsername] = useState('');

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onLogin({ id: '123', name: username });
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded shadow-lg w-full max-w-md dark:bg-gray-900">
//         <h2 className="text-xl font-bold mb-4">Login</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input
//             type="text"
//             placeholder="Username"
//             className="w-full border border-gray-300 px-3 py-2 rounded"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             required
//           />
//           <div className="flex justify-end space-x-2">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
//             >
//               Cancel
//             </button>
//             <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
//               Login
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }