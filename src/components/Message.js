import React from 'react'
import CryptoJS from 'crypto-js';
import { HStack, Avatar, Text } from '@chakra-ui/react'
function Message({text,time, uri, user='other'}) {
    var bytes = CryptoJS.AES.decrypt(text, 'my-secret-key@123'); 
    var decryptedText = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    const currTime = time && time.toDate() && time.toDate().toTimeString();
    const onlyTimeString = currTime &&  currTime.substring(0,currTime.indexOf(' '))
    const MessageTime = onlyTimeString && onlyTimeString.substring(0,onlyTimeString.indexOf(':')+3)
  return (
    <HStack alignSelf={user === 'me' ? 'flex-end' : 'flex-start'} paddingX={4} paddingY={2} bg={'gray.200'} borderRadius={'base'}>
        {user === 'other' && <Avatar src={uri} size='sm' /> }
        <Text fontFamily={'Lato'} fontSize={'0.7rem'} letterSpacing={1} maxWidth={250} >{decryptedText}</Text>
        <Text fontFamily={'Lato'} alignSelf={'flex-end'} fontSize={'0.55rem'} letterSpacing={1} >{MessageTime}</Text>
        {user === 'me' && <Avatar src={uri} size='sm' /> }
    </HStack>
  )
}

export default Message