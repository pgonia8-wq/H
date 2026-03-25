import { supabase } from "../../../src/supabaseClient";
export async function trackImpression(postId: string, creatorId: string) {
  try {
    await supabase.from("ad_metrics").insert({
      post_id: postId,
      user_id: creatorId,
      type: "impression",
      value: 0.001,
    });
  } catch (e) {
    console.error("impression error", e);
  }
}

export async function trackClick(postId: string, creatorId: string) {
  try {
    await supabase.from("ad_metrics").insert({
      post_id: postId,
      user_id: creatorId,
      type: "click",
      value: 0.02,
    });
  } catch (e) {
    console.error("click error", e);
  }
}
