import React,{useEffect,useRef,useState} from "react"
import { supabase } from "../../supabaseClient"

const ChatRoom = ({conversationId,currentUserId}) => {

const [messages,setMessages] = useState([])
const [newMessage,setNewMessage] = useState("")
const [typing,setTyping] = useState(false)

const bottomRef = useRef(null)

useEffect(()=>{

loadMessages()

const channel = supabase
.channel(`chat-${conversationId}`)

.on(
"postgres_changes",
{
event:"INSERT",
schema:"public",
table:"messages",
filter:`conversation_id=eq.${conversationId}`
},
payload=>{
setMessages(prev=>[...prev,payload.new])
}
)

.on(
"broadcast",
{event:"typing"},
payload=>{

if(payload.payload.user !== currentUserId){

setTyping(true)

setTimeout(()=>{
setTyping(false)
},2000)

}

}
)

.subscribe()

return ()=>{
supabase.removeChannel(channel)
}

},[conversationId])

useEffect(()=>{
bottomRef.current?.scrollIntoView({behavior:"smooth"})
},[messages])

const loadMessages = async()=>{

const {data} = await supabase
.from("messages")
.select("*")
.eq("conversation_id",conversationId)
.order("created_at",{ascending:false})
.limit(20)

setMessages(data.reverse())

await supabase
.from("messages")
.update({read:true})
.eq("conversation_id",conversationId)
.neq("sender_id",currentUserId)

}

const sendTyping = async(channel)=>{

channel.send({
type:"broadcast",
event:"typing",
payload:{user:currentUserId}
})

}

const sendMessage = async()=>{

if(!newMessage.trim()) return

await supabase
.from("messages")
.insert({
conversation_id:conversationId,
sender_id:currentUserId,
content:newMessage
})

setNewMessage("")

}

return(

<div className="flex flex-col h-full">

<div className="flex-1 overflow-y-auto p-4 space-y-2">

{messages.map(m=>(

<div
key={m.id}
className={
m.sender_id===currentUserId
? "text-right"
: "text-left"
}
>

<span className="bg-purple-600 text-white px-3 py-1 rounded">
{m.content}
</span>

</div>

))}

{typing && (
<div className="text-xs text-gray-400">
escribiendo...
</div>
)}

<div ref={bottomRef}/>

</div>

<div className="flex gap-2 p-3 border-t border-gray-800">

<input
value={newMessage}
onChange={e=>setNewMessage(e.target.value)}
className="flex-1 bg-gray-900 px-3 py-2 rounded"
placeholder="Escribe un mensaje..."
/>

<button
onClick={sendMessage}
className="bg-purple-600 px-4 py-2 rounded"
>
Enviar
</button>

</div>

</div>

)

}

export default ChatRoom
