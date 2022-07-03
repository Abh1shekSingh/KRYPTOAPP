import React, { useState, useEffect, useRef } from 'react'
import Message from './components/Message.js'
import {app} from "./firebase-config"
import CryptoJS from 'crypto-js'
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, getAuth, signOut } from "firebase/auth"
import { getFirestore,collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from "firebase/firestore"
import { Box, Container, Button, Text, VStack, Input, HStack } from '@chakra-ui/react'

const db = getFirestore(app)
const auth = getAuth(app)
const provider = new GoogleAuthProvider();

const handleGoogleLogin = () => {
  signInWithPopup(auth, provider)
  
}

const logout = () => signOut(auth)


function App() {

  const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'))
  const [user, setUser] = useState(false)
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const divForScroll = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (data) => {
      setUser(data)
    })

    const unsubscribeMessage = onSnapshot(q, (data) => {
      setMessages(data.docs.map((doc) => {
        const id = doc.id
        return {id, ...doc.data()}
        
      }))
    })

    return () => {
      unsubscribe();
      unsubscribeMessage();
    }
  },[])


  const handleSubmit = async(e) => {
      e.preventDefault();
      try {
        setMessage("");
          await addDoc(collection(db, 'messages'), {
            text:CryptoJS.AES.encrypt(JSON.stringify(message), 'my-secret-key@123').toString(),
            uid: user.uid,
            uri:user.photoURL,
            createdAt: serverTimestamp() , 
          });
          
          divForScroll.current.scrollIntoView({behavior: 'smooth'});
          
      } catch (error) {
        alert(error)
      }
  }

  return (
    <Box>
      {user ? (
        <Container bg={"aliceblue"} h={"100vh"}>
        <VStack justifyContent={"center"} h={"100vh"}>

          <HStack padding={"1rem"} w="full" justifyContent={"space-between"} >
            <Text fontFamily={'Montserrat'} letterSpacing={1} fontSize={"1.4rem"}>Krypto Chat</Text>
            <Button fontFamily={'Montserrat'} letterSpacing={1} borderRadius='0px' onClick={logout} colorScheme={'purple'} textColor={"white"}>Logout</Button>
          </HStack>

          <VStack h={"full"} w={"full"} overflowY='auto' css={{"&::-webkit-scrollbar": {
            display:"none"
          }}}>
              {messages.map((item) => (
                <Message key={item.id} time={item.createdAt} text={item.text} uri={item.uri} user={item.uid === user.uid ? 'me' : 'other'} />
              ))}

              <div ref={divForScroll}></div>
          </VStack>

          <form onSubmit={handleSubmit} style={{width:"100%"}}>
            <HStack padding={4}>
              <Input value={message} fontFamily={'Lato'} borderRadius='none' borderColor={'purple'} onChange ={(e) => setMessage(e.target.value)} placeholder='Message' />
              {message === "" ? (
                <Button fontFamily={'Montserrat'} paddingX={7} letterSpacing={1} borderRadius='0px' colorScheme={'purple'} textColor={"white"} disabled >Send 🕊️</Button>
              ): (
                <Button fontFamily={'Montserrat'} paddingX={7} letterSpacing={1} borderRadius='0px' colorScheme={'purple'} textColor={"white"} type="submit">Send 🕊️</Button>
              )}
            </HStack>
          </form>

        </VStack>
      </Container>
      ): <VStack justifyContent={'center'} h={"100vh"} padding={12} bgColor={'gray.800'} >
          <Text fontFamily={'Montserrat'} letterSpacing={1} fontSize={"2.3rem"} color={'white'} textAlign={'center'}>KRYPTO CHAT</Text>
          <Text fontFamily={'Lato'} letterSpacing={1} fontSize={"1rem"} color={'white'} textAlign={'center'}>Protecting your personal information is better than anything else.</Text>
          <Button onClick={handleGoogleLogin} color={"white"} borderRadius='none' colorScheme={'purple'}  >Continue With Google</Button>
      </VStack>}
    </Box>
  )
}

export default App