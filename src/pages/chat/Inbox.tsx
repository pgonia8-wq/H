import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

const Inbox = ({ currentUserId, openChat }) => {

  const [conversations, setConversations] = useState([]);

  useEffect(() => {

    const load = async () => {

      const { data } = await supabase
        .from("conversations")
        .select(`
          *,
          messages (
            content,
            created_at
          )
        `)
        .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)
        .order("created_at", { ascending: false });

      setConversations(data || []);
    };

    load();

  }, [currentUserId]);

  return (
    <div className="space-y-2 p-4">

      {conversations.map(c => {

        const otherUser =
          c.user1_id === currentUserId
            ? c.user2_id
            : c.user1_id;

        return (

          <div
            key={c.id}
            onClick={() => openChat(c.id)}
            className="bg-gray-800 p-3 rounded cursor-pointer"
          >

            <div className="font-bold">
              @{otherUser.slice(0,10)}
            </div>

          </div>

        );

      })}

    </div>
  );
};

export default Inbox;
