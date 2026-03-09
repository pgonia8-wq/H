import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

const Inbox = ({ currentUserId, openChat }) => {

  const [conversations,setConversations] = useState([]);

  useEffect(() => {

    const load = async () => {

      const { data } = await supabase
        .from("conversations")
        .select(`
          *,
          profiles!conversations_user1_id_fkey (
            username,
            avatar_url
          ),
          profiles!conversations_user2_id_fkey (
            username,
            avatar_url
          )
        `)
        .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)
        .order("created_at",{ascending:false});

      setConversations(data || []);

    };

    load();

  },[currentUserId]);

  return (

    <div className="p-4 space-y-2">

      {conversations.map(c => {

        const other =
          c.user1_id === currentUserId
            ? c.profiles_user2
            : c.profiles_user1;

        const otherId =
          c.user1_id === currentUserId
            ? c.user2_id
            : c.user1_id;

        return (

          <div
            key={c.id}
            onClick={()=>openChat(c.id,otherId)}
            className="flex items-center gap-3 p-3 bg-gray-900 rounded cursor-pointer hover:bg-gray-800"
          >

            <img
              src={other?.avatar_url || "/avatar.png"}
              className="w-10 h-10 rounded-full"
            />

            <div>

              <div className="font-bold">
                @{other?.username || otherId.slice(0,10)}
              </div>

            </div>

          </div>

        );

      })}

    </div>

  );

};

export default Inbox;
