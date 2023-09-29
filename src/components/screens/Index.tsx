// import necessary hooks and components
import React from 'react';
import { Dialog } from '@headlessui/react';
import { addDoc, db, collection, getDocs, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { uploadBytesResumable, getDownloadURL, ref } from "firebase/storage";
import { useEffect, useRef, useState } from 'react';
import { useAuthState } from '~/components/contexts/UserContext';
import { SignInButton } from '~/components/domain/auth/SignInButton';
import { SignOutButton } from '~/components/domain/auth/SignOutButton';
import { Head } from '~/components/shared/Head';
import { useFirestore, useStorage } from '~/lib/firebase';
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import NoteCard from '../shared/NoteCard';

export type Note = {
  id: string,
  title: string,
  description: string,
  url: string,
  done?: boolean
}

export enum InputEnum {
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

  const onUpdateNote =  (id: string, data: Partial<Note>) => {
    const docRef = doc(firestore, "notes", id);

     updateDoc(docRef, data)
      .then(docRef => {
        toast.success('Updated note task successfully!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          });
      })
      .catch(error => {
        console.log(error)
      })
  }

  const handleDelete = async (id: any) => {
    try {
       const noteRef = doc(db, 'notes', id);
       await deleteDoc(noteRef);
       toast.success('Note deleted successfully!', {
         position: "top-right",
         autoClose: 5000,
         hideProgressBar: false,
         closeOnClick: true,
         pauseOnHover: true,
         draggable: true,
         progress: undefined,
         theme: "dark",
       });
    } catch (error) {
       toast.error('Error deleting note!', {
         position: "top-right",
         autoClose: 5000,
         hideProgressBar: false,
         closeOnClick: true,
         pauseOnHover: true,
         draggable: true,
         progress: undefined,
         theme: "dark",
       });
    }
   };
  
  

  // function to handle input change
  const handleInputChange = (field: InputEnum, value: string): void => {
    setInputData({ ...inputData, [field]: value });
  }

  //   handle form submit event and add new note in database
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

      toast.success('Created note task successfully!', {
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
            <button type='submit' placeholder='Add new note' className='m-4 p-5 transition-opacity text-slate-50 border border-violet-500 p5 rounded-lg bg-violet-600 bg-opacity-30 hover:bg-opacity-50'>Add new note</button>
          </form>
          <div className="grid grid-cols-3 gap-4 w-full bg-transparent text-slate-50">
              {
                notes.map((note) => (
                  <NoteCard key={note.id} note={note} onUpdate={onUpdateNote} />
                ))
              }
              <button className="btn  absolute bottom-4 right-4 p-0" onClick={handleDelete}>
                <TrashIcon className="h-6 w-6 text-red-900 cursor-pointer" />
              </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default Index;
