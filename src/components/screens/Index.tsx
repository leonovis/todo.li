import { Dialog } from '@headlessui/react';
import { QuerySnapshot, collection, getDocs, query } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { useAuthState } from '~/components/contexts/UserContext';
import { SignInButton } from '~/components/domain/auth/SignInButton';
import { SignOutButton } from '~/components/domain/auth/SignOutButton';
import { Head } from '~/components/shared/Head';
import { useFirestore } from '~/lib/firebase';

type Note = {
  id: string,
  title: string,
  description: string,
  url: string,
  done: boolean
}

function Index() {
  const { state } = useAuthState();
  const [notes, setNotes] = useState<Array<Note>>([]);
  const firestore = useFirestore();

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



  return (
    <>
      <Head title="TOP PAGE" />
      <div className="hero min-h-screen">

      </div>
    </>
  );
}

export default Index;
