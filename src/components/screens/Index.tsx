// import necessary hooks and components
import React from 'react';
import { Dialog } from '@headlessui/react';
import { addDoc, collection, getDocs, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { uploadBytesResumable, getDownloadURL, ref } from "firebase/storage";
import { useEffect, useRef, useState } from 'react';
import { useAuthState } from '~/components/contexts/UserContext';
import { SignInButton } from '~/components/domain/auth/SignInButton';
import { SignOutButton } from '~/components/domain/auth/SignOutButton';
import { Head } from '~/components/shared/Head';
import { useFirestore, useStorage } from '~/lib/firebase';
import { ToastContainer, toast } from 'react-toastify';

type Note = {
  id: string,
  title: string,
  description: string,
  url: string,
  done?: boolean
}

enum InputEnum {
  Id ='id',
  Title = 'title',
  Description = 'description', 
  Url = 'url'

}
// import necessary hooks and components
function Index() {
  const { state } = useAuthState();
  const [notes, setNotes] = useState<Array<Note>>([]);
  const firestore = useFirestore();
  const storage = useStorage();
  // initialize the inputData state with null
  const [image, setImage] = useState("");
  const [inputData, setInputData] = useState<Partial<Note>>({
    title: '',
    description: '',
    url:'',
    done: false
  });

  const [formError, setFormError] = useState<boolean>(false);

   // useEffect hook to fetch data from firestore
  useEffect(() => {
    async function fetchData() {
      const notesCollection = collection(firestore, "notes");
      const toolsQuery = query(notesCollection);
      const querySnapshot = await getDocs(toolsQuery);
      const fetchedData: Array<Note> = [];
      querySnapshot.forEach((doc) => {
        fetchedData.push({ id: doc.id, ...doc.data()} as Note);
      })
      setNotes(fetchedData);
    }
    fetchData();
  }, []);

  // function to handle input change
  const handleInputChange = (field: InputEnum, value: string): void => {
    setInputData({ ...inputData, [field]: value });
  }

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const notesCollection = collection(firestore, "notes");

      const newNote: Partial<Note> = {
        title: inputData.title,
        description: inputData.description,
        url: inputData.url,
      }

      const docRef = await addDoc(notesCollection, newNote);

      toast.success('🦄 Saved the tool successfully!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        });
      setNotes([...notes, { id: docRef.id, ...newNote } as Note]);
      setInputData({
        title: '',
        description: '',
        url: ''
      })
    } catch(error) {
      setFormError(true);
    }
  }


  // return the TSX for the component
  return (
    <>
      <Head title="TOP PAGE" />
      <div className="hero min-h-screen bg-slate-800">
        <div className='max-w-5xl mx-auto'>
          <form className='flex' onSubmit={handleFormSubmit}>
            <input type='text' onChange={(e) => handleInputChange(InputEnum.Title, e.target.value)} value={inputData.title} placeholder='title' className="m-4 text-slate-50 bg-transparent border border-slate-700 focus:ring-slate-400 focus:outline-none p-4 rounded-lg"/>
            <input type='text' onChange={(e) => handleInputChange(InputEnum.Description, e.target.value)} value={inputData.description} placeholder='description' className="m-4 text-slate-50 bg-transparent border border-slate-700 focus:ring-slate-400 focus:outline-none p-4 rounded-lg"/>
            <input type='text' onChange={(e) => handleInputChange(InputEnum.Url, e.target.value)} value={inputData.url} placeholder='url' className="m-4 text-slate-50 bg-transparent border border-slate-700 focus:ring-slate-400 focus:outline-none p-4 rounded-lg"/>
            <button type='submit' placeholder='Add new note' className='m-4 p-5 transition-opacity text-slate-50 border border-purple-500 p5 rounded-lg bg-purple-600 bg-opacity-30 hover:bg-opacity-50'>Add new note</button>
          </form>
          <table className='table w-full bg-transparent text-slate-50'>
            <thead>
              <tr>
                <th className='bg-slate-900 border border-slate-700'>Title</th>
                <th className='bg-slate-900 border border-slate-700'>Desription</th>
                <th className='bg-slate-900 border border-slate-700'>Link</th>
              </tr>
            </thead>
            <tbody>
              {
                notes.map((note) => (
                  <tr key={note.id}>
                    <td className='bg-slate-800 border border-slate-700'>{note.title}</td>
                    <td className='bg-slate-800 border border-slate-700'>{note.description}</td>
                    <td className='bg-slate-800 border border-slate-700'>{note.url}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default Index;
