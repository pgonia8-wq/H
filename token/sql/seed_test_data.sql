-- ============================================================================
  -- H TOKEN — TEST SEED DATA
  -- 21 users (pgonia + 20), 38 tokens (5 pgonia), holdings, activity, snapshots
  -- Bonding curve: price = 0.0000005 + 1.72e-20 * supply^2
  -- Run in Supabase SQL Editor
  -- ============================================================================

  -- 1. PROFILES
  INSERT INTO profiles (id, username, verified, verification_level, orb_verified_at, updated_at)
  VALUES ('usr_pgonia_01','pgonia',true,'orb',now()-interval '14 days', now())
  ON CONFLICT (id) DO UPDATE SET username=EXCLUDED.username, verified=EXCLUDED.verified;
  INSERT INTO profiles (id, username, verified, verification_level, orb_verified_at, updated_at)
  VALUES ('usr_luna_02','luna_trader',true,'orb',now()-interval '11 days', now())
  ON CONFLICT (id) DO UPDATE SET username=EXCLUDED.username, verified=EXCLUDED.verified;
  INSERT INTO profiles (id, username, verified, verification_level, orb_verified_at, updated_at)
  VALUES ('usr_max_03','max_alpha',true,'orb',now()-interval '5 days', now())
  ON CONFLICT (id) DO UPDATE SET username=EXCLUDED.username, verified=EXCLUDED.verified;
  INSERT INTO profiles (id, username, verified, verification_level, orb_verified_at, updated_at)
  VALUES ('usr_sofia_04','sofia.eth',true,'orb',now()-interval '19 days', now())
  ON CONFLICT (id) DO UPDATE SET username=EXCLUDED.username, verified=EXCLUDED.verified;
  INSERT INTO profiles (id, username, verified, verification_level, orb_verified_at, updated_at)
  VALUES ('usr_diego_05','diego_wld',true,'orb',now()-interval '26 days', now())
  ON CONFLICT (id) DO UPDATE SET username=EXCLUDED.username, verified=EXCLUDED.verified;
  INSERT INTO profiles (id, username, verified, verification_level, orb_verified_at, updated_at)
  VALUES ('usr_mia_06','mia_crypto',true,'orb',now()-interval '22 days', now())
  ON CONFLICT (id) DO UPDATE SET username=EXCLUDED.username, verified=EXCLUDED.verified;
  INSERT INTO profiles (id, username, verified, verification_level, orb_verified_at, updated_at)
  VALUES ('usr_carlos_07','carlos_moon',true,'orb',now()-interval '6 days', now())
  ON CONFLICT (id) DO UPDATE SET username=EXCLUDED.username, verified=EXCLUDED.verified;
  INSERT INTO profiles (id, username, verified, verification_level, orb_verified_at, updated_at)
  VALUES ('usr_elena_08','elena_nft',true,'orb',now()-interval '4 days', now())
  ON CONFLICT (id) DO UPDATE SET username=EXCLUDED.username, verified=EXCLUDED.verified;
  INSERT INTO profiles (id, username, verified, updated_at)
  VALUES ('usr_jake_09','jake_diamond',false, now())
  ON CONFLICT (id) DO UPDATE SET username=EXCLUDED.username, verified=EXCLUDED.verified;
  INSERT INTO profiles (id, username, verified, verification_level, orb_verified_at, updated_at)
  VALUES ('usr_nina_10','nina_degen',true,'orb',now()-interval '27 days', now())
  ON CONFLICT (id) DO UPDATE SET username=EXCLUDED.username, verified=EXCLUDED.verified;
  INSERT INTO profiles (id, username, verified, verification_level, orb_verified_at, updated_at)
  VALUES ('usr_pablo_11','pablo_sol',true,'orb',now()-interval '5 days', now())
  ON CONFLICT (id) DO UPDATE SET username=EXCLUDED.username, verified=EXCLUDED.verified;
  INSERT INTO profiles (id, username, verified, verification_level, orb_verified_at, updated_at)
  VALUES ('usr_anna_12','anna_hodl',true,'orb',now()-interval '3 days', now())
  ON CONFLICT (id) DO UPDATE SET username=EXCLUDED.username, verified=EXCLUDED.verified;
  INSERT INTO profiles (id, username, verified, updated_at)
  VALUES ('usr_tomas_13','tomas_dev',false, now())
  ON CONFLICT (id) DO UPDATE SET username=EXCLUDED.username, verified=EXCLUDED.verified;
  INSERT INTO profiles (id, username, verified, verification_level, orb_verified_at, updated_at)
  VALUES ('usr_iris_14','iris_world',true,'orb',now()-interval '7 days', now())
  ON CONFLICT (id) DO UPDATE SET username=EXCLUDED.username, verified=EXCLUDED.verified;
  INSERT INTO profiles (id, username, verified, verification_level, orb_verified_at, updated_at)
  VALUES ('usr_leo_15','leo_pump',true,'orb',now()-interval '19 days', now())
  ON CONFLICT (id) DO UPDATE SET username=EXCLUDED.username, verified=EXCLUDED.verified;
  INSERT INTO profiles (id, username, verified, verification_level, orb_verified_at, updated_at)
  VALUES ('usr_val_16','val_builder',true,'orb',now()-interval '10 days', now())
  ON CONFLICT (id) DO UPDATE SET username=EXCLUDED.username, verified=EXCLUDED.verified;
  INSERT INTO profiles (id, username, verified, verification_level, orb_verified_at, updated_at)
  VALUES ('usr_marco_17','marco_ape',true,'orb',now()-interval '20 days', now())
  ON CONFLICT (id) DO UPDATE SET username=EXCLUDED.username, verified=EXCLUDED.verified;
  INSERT INTO profiles (id, username, verified, verification_level, orb_verified_at, updated_at)
  VALUES ('usr_sara_18','sara_gem',true,'orb',now()-interval '9 days', now())
  ON CONFLICT (id) DO UPDATE SET username=EXCLUDED.username, verified=EXCLUDED.verified;
  INSERT INTO profiles (id, username, verified, updated_at)
  VALUES ('usr_dan_19','dan_orbit',false, now())
  ON CONFLICT (id) DO UPDATE SET username=EXCLUDED.username, verified=EXCLUDED.verified;
  INSERT INTO profiles (id, username, verified, verification_level, orb_verified_at, updated_at)
  VALUES ('usr_lucia_20','lucia_bag',true,'orb',now()-interval '2 days', now())
  ON CONFLICT (id) DO UPDATE SET username=EXCLUDED.username, verified=EXCLUDED.verified;
  INSERT INTO profiles (id, username, verified, verification_level, orb_verified_at, updated_at)
  VALUES ('usr_rafa_21','rafa_whale',true,'orb',now()-interval '28 days', now())
  ON CONFLICT (id) DO UPDATE SET username=EXCLUDED.username, verified=EXCLUDED.verified;
  
-- 2. TOKENS
INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_wpepe','WorldPepe','WPEPE','🐸','usr_pgonia_01','pgonia',0.000035329999999999995,0.00010598999999999998,4769.5500,122,27.2475,15.3,245,100000000,45000000,'The first meme token on World Chain. Pepe meets humanity proof.',true,'["Meme","Hot"]'::jsonb,72,544.950000,8.972640,false,5,now()-interval '2 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_mdust','MoonDust','MDUST','🌙','usr_pgonia_01','pgonia',0.0000029767999999999996,0.000008930399999999998,107.1648,19,0.7954,5.7,38,100000000,12000000,'Lunar vibes, infinite potential.',false,'["New","Community"]'::jsonb,60,15.907200,0.298596,false,5,now()-interval '7 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_orbcoin','OrbCoin','ORBC','🔮','usr_pgonia_01','pgonia',0.0000666168,0.0001998504,12390.7248,218,69.8707,22.1,890,100000000,62000000,'Only verified humans. The most trusted token.',true,'["Blue Chip","Verified"]'::jsonb,81,1397.413867,25.404998,false,5,now()-interval '20 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_hyperh','HyperH','HYPH','⚡','usr_pgonia_01','pgonia',7.107e-7,0.0000021321000000000003,7.4623,16,0.0998,-2.1,12,100000000,3500000,'Speed matters. Built for the H social layer.',false,'["New","Social"]'::jsonb,45,1.995817,0.031944,false,5,now()-interval '19 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_dhand','DiamondHands','DHAND','💎','usr_pgonia_01','pgonia',0.0000139848,0.0000419544,1174.7232,60,6.9929,8.9,156,100000000,28000000,'Never selling. Community of believers.',true,'["Community","Diamond"]'::jsonb,68,139.858133,2.133912,false,5,now()-interval '8 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_solara','Solara','SOLAR','☀️','usr_luna_02','luna_trader',0.00005253,0.00015759,8667.4500,241,49.0692,18.5,520,100000000,55000000,'Solar-powered degens.',true,'["Hot","Energy"]'::jsonb,77,981.383333,17.340187,false,5,now()-interval '19 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_nocturne','Nocturne','NOCT','🦇','usr_luna_02','luna_trader',0.0000016008,0.0000048024,38.4192,36,0.3468,3.2,22,100000000,8000000,'Night owls unite.',false,'["New","Night"]'::jsonb,55,6.935467,0.121143,false,5,now()-interval '3 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_alpha','AlphaDAO','ALPHA','🧠','usr_max_03','max_alpha',0.000025336799999999998,0.0000760104,2888.3952,77,16.6800,12.4,310,100000000,38000000,'Governance token for alpha hunters.',true,'["DAO","Governance"]'::jsonb,70,333.599467,6.569535,false,5,now()-interval '27 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_apex','ApexRun','APEX','🏔️','usr_max_03','max_alpha',0.0000043700000000000005,0.000013110000000000002,196.6500,68,1.3425,6.8,67,100000000,15000000,'Race to the top.',false,'["Gaming","Compete"]'::jsonb,62,26.850000,0.484366,false,5,now()-interval '21 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_rosa','RosaCoin','ROSA','🌹','usr_sofia_04','sofia.eth',0.0000088248,0.000026474400000000002,582.4368,83,3.6024,-1.5,44,100000000,22000000,'Beauty in decentralization.',false,'["Art","Beauty"]'::jsonb,48,72.048533,1.358958,false,5,now()-interval '13 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_fuego','Fuego','FUEG','🔥','usr_diego_05','diego_wld',0.0000777108,0.00023313240000000002,15619.8708,225,87.8937,31.2,1100,100000000,67000000,'On fire. Unstoppable momentum.',true,'["Hot","Fire"]'::jsonb,88,1757.874533,26.432347,false,5,now()-interval '11 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_hielo','IceAge','ICE','🧊','usr_diego_05','diego_wld',9.3e-7,0.00000279,13.9500,40,0.1608,0.3,8,100000000,5000000,'Cool heads prevail.',false,'["New","Chill"]'::jsonb,50,3.216667,0.047043,false,5,now()-interval '24 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_pixel','PixelWorld','PIXL','🎮','usr_mia_06','mia_crypto',0.0000192308,0.0000576924,1903.8492,147,11.1269,9.7,178,100000000,33000000,'Gaming meets DeFi.',true,'["Gaming","Pixel"]'::jsonb,65,222.538800,3.759493,false,5,now()-interval '7 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_vibe','VibeCheck','VIBE','✨','usr_mia_06','mia_crypto',0.000008085199999999998,0.000024255599999999995,509.3676,85,3.1798,3.8,48,100000000,21000000,'Only good vibes allowed.',false,'["Community","Vibe"]'::jsonb,58,63.596400,0.898602,false,5,now()-interval '15 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_luna','LunarDAO','LNAO','🌕','usr_carlos_07','carlos_moon',0.0000308408,0.0000925224,3885.9408,105,22.2886,4.1,95,100000000,42000000,'Decentralized lunar exploration fund.',false,'["DAO","Space"]'::jsonb,58,445.771200,6.412972,false,5,now()-interval '19 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_crater','CraterCoin','CRTR','🕳️','usr_carlos_07','carlos_moon',5.387e-7,0.0000016161,2.4242,17,0.0385,-5.2,4,100000000,1500000,'From the depths.',false,'["New","Deep"]'::jsonb,35,0.769350,0.014062,false,5,now()-interval '12 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_nftape','ApeNFT','ANFT','🦍','usr_elena_08','elena_nft',0.000040128799999999994,0.00012038639999999998,5778.5472,79,32.9030,14.8,380,100000000,48000000,'Apes together strong.',true,'["NFT","Community"]'::jsonb,73,658.060800,10.787042,false,5,now()-interval '15 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_canvas','CanvasDAO','CNVS','🎨','usr_elena_08','elena_nft',0.0000060728,0.000018218399999999998,327.9312,49,2.1218,2.9,51,100000000,18000000,'Art governance for the creator economy.',false,'["Art","DAO"]'::jsonb,56,42.436800,0.564588,false,5,now()-interval '11 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_yolo','YoloCoin','YOLO','🎲','usr_jake_09','jake_diamond',0.000047008799999999996,0.0001410264,7333.3728,237,41.6076,25.6,670,100000000,52000000,'You only live once. Full send.',true,'["Meme","YOLO"]'::jsonb,82,832.152533,9.455057,false,5,now()-interval '28 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_zen','ZenToken','ZEN','🧘','usr_nina_10','nina_degen',0.0000121272,0.0000363816,945.9216,36,5.6885,1.8,35,100000000,26000000,'Find your inner peace.',false,'["Wellness","Zen"]'::jsonb,52,113.769067,1.569503,false,5,now()-interval '13 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_chaos','ChaosDAO','CHAOS','🌀','usr_nina_10','nina_degen',0.00002802,0.00008406,3362.4000,170,19.3467,-3.4,88,100000000,40000000,'Embrace the chaos.',false,'["DAO","Chaos"]'::jsonb,42,386.933333,6.304376,false,5,now()-interval '8 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_mate','MateCoin','MATE','🧉','usr_pablo_11','pablo_sol',0.0000067092,0.0000201276,382.4244,44,2.4412,7.3,62,100000000,19000000,'Fueled by mate. LatAm degen energy.',false,'["LatAm","Community"]'::jsonb,64,48.824933,0.785281,false,5,now()-interval '25 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_fomo','FomoCoin','FOMO','😱','usr_pablo_11','pablo_sol',0.0000563828,0.0001691484,9641.4588,181,54.5137,20.4,580,100000000,57000000,'Dont miss out. FOMO is real.',true,'["Meme","FOMO"]'::jsonb,79,1090.273200,19.308023,false,5,now()-interval '20 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_hodl','HodlForever','HODL','🫡','usr_anna_12','anna_hodl',0.00005836079999999999,0.0001750824,10154.7792,195,57.3821,11.2,430,100000000,58000000,'We dont sell. Period.',true,'["Diamond","HODL"]'::jsonb,75,1147.642133,18.913697,false,5,now()-interval '28 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_devtool','DevTools','DEVT','🛠️','usr_tomas_13','tomas_dev',0.0000013428,0.0000040284,28.1988,16,0.2733,0.9,15,100000000,7000000,'Built by devs, for devs.',false,'["Dev","Tools"]'::jsonb,53,5.466533,0.062311,false,5,now()-interval '10 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_debug','DebugCoin','DBUG','🐛','usr_tomas_13','tomas_dev',5.688e-7,0.0000017063999999999999,3.4128,14,0.0523,-0.7,6,100000000,2000000,'Fix bugs, earn tokens.',false,'["New","Dev"]'::jsonb,47,1.045867,0.020122,false,5,now()-interval '24 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_globe','GlobeToken','GLBE','🌍','usr_iris_14','iris_world',0.00002157,0.00006471,2264.8500,160,13.1658,5.5,120,100000000,35000000,'One world, one token.',false,'["Global","UBI"]'::jsonb,61,263.316667,4.068274,false,5,now()-interval '8 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_rocket','RocketFuel','RKTF','🚀','usr_leo_15','leo_pump',0.00007095119999999999,0.00021285359999999998,13622.6304,236,76.7479,28.7,950,100000000,64000000,'Fueling the next moonshot.',true,'["Hot","Rocket"]'::jsonb,85,1534.958933,24.380642,false,5,now()-interval '23 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_pump','PumpItUp','PUMP','💪','usr_leo_15','leo_pump',0.0000170292,0.000051087599999999995,1583.7156,172,9.3151,19.3,290,100000000,31000000,'Only up. Never down.',true,'["Meme","Pump"]'::jsonb,74,186.301733,3.575623,false,5,now()-interval '9 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_brick','BrickByBrick','BRCK','🧱','usr_val_16','val_builder',0.0000038712,0.0000116136,162.5904,24,1.1366,3.6,42,100000000,14000000,'Building the future one block at a time.',false,'["Build","Infra"]'::jsonb,57,22.732267,0.364704,false,5,now()-interval '2 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_banana','BananaCoin','BNNA','🍌','usr_marco_17','marco_ape',0.0000323028,0.00009690839999999999,4167.0612,60,23.8670,16.9,340,100000000,43000000,'Apes love bananas.',true,'["Meme","Ape"]'::jsonb,71,477.340133,5.343158,false,5,now()-interval '17 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_jungle','JungleDAO','JNGL','🌴','usr_marco_17','marco_ape',0.0000018932,0.0000056796,51.1164,33,0.4340,4.5,28,100000000,9000000,'Welcome to the jungle.',false,'["DAO","Wild"]'::jsonb,54,8.679600,0.118611,false,5,now()-interval '4 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_gem','HiddenGem','HGEM','💠','usr_sara_18','sara_gem',0.0000025812,0.0000077436,85.1796,15,0.6566,8.1,55,100000000,11000000,'The gem you were looking for.',false,'["Alpha","Gem"]'::jsonb,63,13.131067,0.231635,false,5,now()-interval '26 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_orbit','OrbitDAO','ORBT','🪐','usr_dan_19','dan_orbit',0.000024046799999999998,0.0000721404,2669.1948,85,15.4455,6.2,98,100000000,37000000,'Decentralized space governance.',false,'["DAO","Space"]'::jsonb,59,308.910533,6.133435,false,5,now()-interval '2 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_bag','BagHolder','BAGS','💰','usr_lucia_20','lucia_bag',0.0000435,0.0001305,6525.0000,212,37.0833,13.5,410,100000000,50000000,'We hold bags with pride.',true,'["Meme","Community"]'::jsonb,69,741.666667,10.678434,false,5,now()-interval '2 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_stack','StackSats','STAK','📚','usr_lucia_20','lucia_bag',7.752e-7,0.0000023256000000000002,9.3024,8,0.1183,1.2,10,100000000,4000000,'Stack tokens like you stack books.',false,'["New","Stack"]'::jsonb,51,2.366933,0.036607,false,5,now()-interval '16 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_whale','WhaleAlert','WHAL','🐋','usr_rafa_21','rafa_whale',0.0000823892,0.0002471676,17054.5644,277,95.8976,35.8,1500,100000000,69000000,'Only whales allowed. Big moves only.',true,'["Whale","Hot"]'::jsonb,90,1917.951600,28.978283,false,5,now()-interval '8 days')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO tokens (id,name,symbol,emoji,creator_id,creator_name,price_wld,price_usdc,market_cap,holders,curve_percent,change_24h,volume_24h,total_supply,circulating_supply,description,is_trending,tags,buy_pressure,total_wld_in_curve,treasury_balance,graduated,creation_fee_wld,created_at)
  VALUES ('tok_shrimp','ShrimpCoin','SHRP','🦐','usr_rafa_21','rafa_whale',0.0000049032,0.000014709599999999999,235.3536,80,1.5742,2.3,33,100000000,16000000,'Small but mighty.',false,'["Community","Small"]'::jsonb,55,31.483733,0.488672,false,5,now()-interval '2 days')
  ON CONFLICT (id) DO NOTHING;
  
-- 3. HOLDINGS
INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_pgonia_01','tok_wpepe','WorldPepe','WPEPE','🐸',3834232,0.000017566699999999992,0.000035329999999999995,406.390250,204.325840,101.12,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_mia_06','tok_wpepe','WorldPepe','WPEPE','🐸',1692667,0.000017566699999999992,0.000035329999999999995,179.405775,90.202055,101.12,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_luna_02','tok_wpepe','WorldPepe','WPEPE','🐸',401264,0.000017566699999999992,0.000035329999999999995,42.529971,21.383318,101.12,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_carlos_07','tok_wpepe','WorldPepe','WPEPE','🐸',1611501,0.000017566699999999992,0.000035329999999999995,170.802991,85.876727,101.12,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_max_03','tok_wpepe','WorldPepe','WPEPE','🐸',1538381,0.000017566699999999992,0.000035329999999999995,163.053002,81.980170,101.12,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_iris_14','tok_wpepe','WorldPepe','WPEPE','🐸',641805,0.000017566699999999992,0.000035329999999999995,68.024912,34.201724,101.12,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_pgonia_01','tok_mdust','MoonDust','MDUST','🌙',941777,0.000001713632,0.0000029767999999999996,8.410445,3.568868,73.71,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_dan_19','tok_mdust','MoonDust','MDUST','🌙',252482,0.000001713632,0.0000029767999999999996,2.254765,0.956782,73.71,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_nina_10','tok_mdust','MoonDust','MDUST','🌙',467455,0.000001713632,0.0000029767999999999996,4.174560,1.771423,73.71,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_luna_02','tok_mdust','MoonDust','MDUST','🌙',204519,0.000001713632,0.0000029767999999999996,1.826436,0.775026,73.71,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_max_03','tok_mdust','MoonDust','MDUST','🌙',410245,0.000001713632,0.0000029767999999999996,3.663652,1.554625,73.71,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_pgonia_01','tok_orbcoin','OrbCoin','ORBC','🔮',5757081,0.000032897231999999995,0.0000666168,1150.554941,582.378853,102.50,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_anna_12','tok_orbcoin','OrbCoin','ORBC','🔮',954708,0.000032897231999999995,0.0000666168,190.798776,96.577024,102.50,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_sara_18','tok_orbcoin','OrbCoin','ORBC','🔮',722289,0.000032897231999999995,0.0000666168,144.349746,73.065819,102.50,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_elena_08','tok_orbcoin','OrbCoin','ORBC','🔮',2739398,0.000032897231999999995,0.0000666168,547.469786,277.113951,102.50,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_carlos_07','tok_orbcoin','OrbCoin','ORBC','🔮',1766578,0.000032897231999999995,0.0000666168,353.051320,178.704741,102.50,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_mia_06','tok_orbcoin','OrbCoin','ORBC','🔮',444330,0.000032897231999999995,0.0000666168,88.799528,44.947847,102.50,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_diego_05','tok_orbcoin','OrbCoin','ORBC','🔮',2262488,0.000032897231999999995,0.0000666168,452.159132,228.870354,102.50,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_pgonia_01','tok_hyperh','HyperH','HYPH','⚡',315868,6.032429999999999e-7,7.107e-7,0.673462,0.101827,17.81,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_pablo_11','tok_hyperh','HyperH','HYPH','⚡',92527,6.032429999999999e-7,7.107e-7,0.197277,0.029828,17.81,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_val_16','tok_hyperh','HyperH','HYPH','⚡',110957,6.032429999999999e-7,7.107e-7,0.236571,0.035769,17.81,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_tomas_13','tok_hyperh','HyperH','HYPH','⚡',134255,6.032429999999999e-7,7.107e-7,0.286245,0.043280,17.81,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_pgonia_01','tok_dhand','DiamondHands','DHAND','💎',2638775,0.000007107552,0.0000139848,110.708222,54.442530,96.76,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_lucia_20','tok_dhand','DiamondHands','DHAND','💎',665125,0.000007107552,0.0000139848,27.904920,13.722689,96.76,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_luna_02','tok_dhand','DiamondHands','DHAND','💎',893100,0.000007107552,0.0000139848,37.469475,18.426211,96.76,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_leo_15','tok_dhand','DiamondHands','DHAND','💎',371108,0.000007107552,0.0000139848,15.569613,7.656605,96.76,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_dan_19','tok_dhand','DiamondHands','DHAND','💎',694928,0.000007107552,0.0000139848,29.155287,14.337577,96.76,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_luna_02','tok_solara','Solara','SOLAR','☀️',2134482,0.000025994699999999997,0.00005253,336.373018,169.917361,102.08,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_pgonia_01','tok_solara','Solara','SOLAR','☀️',1144059,0.000025994699999999997,0.00005253,180.292258,91.073846,102.08,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_jake_09','tok_solara','Solara','SOLAR','☀️',1081565,0.000025994699999999997,0.00005253,170.443828,86.098955,102.08,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_lucia_20','tok_solara','Solara','SOLAR','☀️',1706946,0.000025994699999999997,0.00005253,268.997620,135.882973,102.08,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_anna_12','tok_solara','Solara','SOLAR','☀️',1200596,0.000025994699999999997,0.00005253,189.201924,95.574525,102.08,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_rafa_21','tok_solara','Solara','SOLAR','☀️',1889041,0.000025994699999999997,0.00005253,297.693971,150.378809,102.08,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_tomas_13','tok_solara','Solara','SOLAR','☀️',464949,0.000025994699999999997,0.00005253,73.271313,37.012684,102.08,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_mia_06','tok_solara','Solara','SOLAR','☀️',1883450,0.000025994699999999997,0.00005253,296.812885,149.933732,102.08,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_luna_02','tok_nocturne','Nocturne','NOCT','🦇',412721,0.000001039392,0.0000016008,1.982051,0.695115,54.01,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_val_16','tok_nocturne','Nocturne','NOCT','🦇',153399,0.000001039392,0.0000016008,0.736683,0.258358,54.01,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_jake_09','tok_nocturne','Nocturne','NOCT','🦇',135517,0.000001039392,0.0000016008,0.650807,0.228241,54.01,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_sara_18','tok_nocturne','Nocturne','NOCT','🦇',276682,0.000001039392,0.0000016008,1.328738,0.465994,54.01,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_max_03','tok_alpha','AlphaDAO','ALPHA','🧠',3781913,0.000012670032,0.000025336799999999998,287.464720,143.713844,99.97,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_nina_10','tok_alpha','AlphaDAO','ALPHA','🧠',787841,0.000012670032,0.000025336799999999998,59.884110,29.938198,99.97,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_pablo_11','tok_alpha','AlphaDAO','ALPHA','🧠',883486,0.000012670032,0.000025336799999999998,67.154124,33.572737,99.97,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_pgonia_01','tok_alpha','AlphaDAO','ALPHA','🧠',328368,0.000012670032,0.000025336799999999998,24.959383,12.478084,99.97,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_elena_08','tok_alpha','AlphaDAO','ALPHA','🧠',445067,0.000012670032,0.000025336799999999998,33.829721,16.912681,99.97,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_rafa_21','tok_alpha','AlphaDAO','ALPHA','🧠',494039,0.000012670032,0.000025336799999999998,37.552102,18.773632,99.97,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_luna_02','tok_alpha','AlphaDAO','ALPHA','🧠',1380816,0.000012670032,0.000025336799999999998,104.956376,52.471428,99.97,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_max_03','tok_apex','ApexRun','APEX','🏔️',1272179,0.0000023963,0.0000043700000000000005,16.678267,7.532699,82.36,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_lucia_20','tok_apex','ApexRun','APEX','🏔️',234065,0.0000023963,0.0000043700000000000005,3.068592,1.385922,82.36,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_pgonia_01','tok_apex','ApexRun','APEX','🏔️',92474,0.0000023963,0.0000043700000000000005,1.212334,0.547548,82.36,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_jake_09','tok_apex','ApexRun','APEX','🏔️',554301,0.0000023963,0.0000043700000000000005,7.266886,3.282072,82.36,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_diego_05','tok_apex','ApexRun','APEX','🏔️',646147,0.0000023963,0.0000043700000000000005,8.470987,3.825901,82.36,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_sofia_04','tok_rosa','RosaCoin','ROSA','🌹',1195163,0.000004579152,0.0000088248,31.641223,15.222724,92.72,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_lucia_20','tok_rosa','RosaCoin','ROSA','🌹',280617,0.000004579152,0.0000088248,7.429167,3.574203,92.72,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_carlos_07','tok_rosa','RosaCoin','ROSA','🌹',289923,0.000004579152,0.0000088248,7.675537,3.692733,92.72,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_tomas_13','tok_rosa','RosaCoin','ROSA','🌹',220991,0.000004579152,0.0000088248,5.850604,2.814750,92.72,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_elena_08','tok_rosa','RosaCoin','ROSA','🌹',154440,0.000004579152,0.0000088248,4.088706,1.967094,92.72,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_anna_12','tok_rosa','RosaCoin','ROSA','🌹',958927,0.000004579152,0.0000088248,25.387017,12.213799,92.72,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_diego_05','tok_fuego','Fuego','FUEG','🔥',5976616,0.000038333292,0.0000777108,1393.342832,706.032733,102.72,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_sofia_04','tok_fuego','Fuego','FUEG','🔥',1971781,0.000038333292,0.0000777108,459.686037,232.931466,102.72,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_jake_09','tok_fuego','Fuego','FUEG','🔥',1765517,0.000038333292,0.0000777108,411.599215,208.564979,102.72,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_pgonia_01','tok_fuego','Fuego','FUEG','🔥',1477349,0.000038333292,0.0000777108,344.417918,174.522966,102.72,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_marco_17','tok_fuego','Fuego','FUEG','🔥',519735,0.000038333292,0.0000777108,121.167068,61.397607,102.72,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_nina_10','tok_fuego','Fuego','FUEG','🔥',834898,0.000038333292,0.0000777108,194.641774,98.628608,102.72,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_luna_02','tok_fuego','Fuego','FUEG','🔥',842307,0.000038333292,0.0000777108,196.369052,99.503852,102.72,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_diego_05','tok_hielo','IceAge','ICE','🧊',113412,7.107e-7,9.3e-7,0.316419,0.074614,30.86,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_pgonia_01','tok_hielo','IceAge','ICE','🧊',98915,7.107e-7,9.3e-7,0.275973,0.065076,30.86,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_anna_12','tok_hielo','IceAge','ICE','🧊',199083,7.107e-7,9.3e-7,0.555442,0.130977,30.86,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_jake_09','tok_hielo','IceAge','ICE','🧊',92282,7.107e-7,9.3e-7,0.257467,0.060712,30.86,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_luna_02','tok_hielo','IceAge','ICE','🧊',204821,7.107e-7,9.3e-7,0.571451,0.134752,30.86,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_mia_06','tok_pixel','PixelWorld','PIXL','🎮',727034,0.000009678092,0.0000192308,41.944336,20.835431,98.70,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_rafa_21','tok_pixel','PixelWorld','PIXL','🎮',773802,0.000009678092,0.0000192308,44.642495,22.175714,98.70,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_sara_18','tok_pixel','PixelWorld','PIXL','🎮',825922,0.000009678092,0.0000192308,47.649422,23.669375,98.70,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_jake_09','tok_pixel','PixelWorld','PIXL','🎮',1285283,0.000009678092,0.0000192308,74.151061,36.833800,98.70,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_carlos_07','tok_pixel','PixelWorld','PIXL','🎮',463778,0.000009678092,0.0000192308,26.756466,13.291007,98.70,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_mia_06','tok_vibe','VibeCheck','VIBE','✨',457642,0.0000042167479999999994,0.000008085199999999998,11.100381,5.311098,91.74,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_sofia_04','tok_vibe','VibeCheck','VIBE','✨',604883,0.0000042167479999999994,0.000008085199999999998,14.671800,7.019883,91.74,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_dan_19','tok_vibe','VibeCheck','VIBE','✨',521982,0.0000042167479999999994,0.000008085199999999998,12.660987,6.057787,91.74,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_elena_08','tok_vibe','VibeCheck','VIBE','✨',360118,0.0000042167479999999994,0.000008085199999999998,8.734878,4.179298,91.74,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_tomas_13','tok_vibe','VibeCheck','VIBE','✨',530018,0.0000042167479999999994,0.000008085199999999998,12.855905,6.151048,91.74,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_val_16','tok_vibe','VibeCheck','VIBE','✨',919793,0.0000042167479999999994,0.000008085199999999998,22.310131,10.674525,91.74,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_anna_12','tok_vibe','VibeCheck','VIBE','✨',351880,0.0000042167479999999994,0.000008085199999999998,8.535061,4.083693,91.74,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_carlos_07','tok_luna','LunarDAO','LNAO','🌕',1922005,0.000015366991999999995,0.0000308408,177.828515,89.222209,100.70,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_sofia_04','tok_luna','LunarDAO','LNAO','🌕',1539468,0.000015366991999999995,0.0000308408,142.435274,71.464297,100.70,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_jake_09','tok_luna','LunarDAO','LNAO','🌕',346328,0.000015366991999999995,0.0000308408,32.043098,16.077039,100.70,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_anna_12','tok_luna','LunarDAO','LNAO','🌕',953487,0.000015366991999999995,0.0000308408,88.218906,44.262224,100.70,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_rafa_21','tok_luna','LunarDAO','LNAO','🌕',1236314,0.000015366991999999995,0.0000308408,114.386738,57.391456,100.70,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_lucia_20','tok_luna','LunarDAO','LNAO','🌕',668448,0.000015366991999999995,0.0000308408,61.846413,31.030308,100.70,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_diego_05','tok_luna','LunarDAO','LNAO','🌕',728894,0.000015366991999999995,0.0000308408,67.439022,33.836297,100.70,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_carlos_07','tok_crater','CraterCoin','CRTR','🕳️',130007,5.18963e-7,5.387e-7,0.210104,0.007698,3.80,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_pgonia_01','tok_crater','CraterCoin','CRTR','🕳️',43950,5.18963e-7,5.387e-7,0.071028,0.002602,3.80,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_marco_17','tok_crater','CraterCoin','CRTR','🕳️',59169,5.18963e-7,5.387e-7,0.095623,0.003503,3.80,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_mia_06','tok_crater','CraterCoin','CRTR','🕳️',39660,5.18963e-7,5.387e-7,0.064095,0.002348,3.80,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_jake_09','tok_crater','CraterCoin','CRTR','🕳️',9042,5.18963e-7,5.387e-7,0.014613,0.000535,3.80,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_sofia_04','tok_crater','CraterCoin','CRTR','🕳️',16605,5.18963e-7,5.387e-7,0.026835,0.000983,3.80,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_elena_08','tok_nftape','ApeNFT','ANFT','🦍',4693088,0.000019918111999999998,0.000040128799999999994,564.983969,284.551612,101.47,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_luna_02','tok_nftape','ApeNFT','ANFT','🦍',1955529,0.000019918111999999998,0.000040128799999999994,235.419096,118.567759,101.47,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_val_16','tok_nftape','ApeNFT','ANFT','🦍',351320,0.000019918111999999998,0.000040128799999999994,42.294150,21.301257,101.47,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_lucia_20','tok_nftape','ApeNFT','ANFT','🦍',1414767,0.000019918111999999998,0.000040128799999999994,170.318706,85.780243,101.47,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_elena_08','tok_canvas','CanvasDAO','CNVS','🎨',1339521,0.0000032306719999999995,0.0000060728,24.403929,11.421270,87.97,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_val_16','tok_canvas','CanvasDAO','CNVS','🎨',642508,0.0000032306719999999995,0.0000060728,11.705468,5.478270,87.97,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_max_03','tok_canvas','CanvasDAO','CNVS','🎨',584926,0.0000032306719999999995,0.0000060728,10.656416,4.987304,87.97,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_sofia_04','tok_canvas','CanvasDAO','CNVS','🎨',342074,0.0000032306719999999995,0.0000060728,6.232041,2.916654,87.97,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_sara_18','tok_canvas','CanvasDAO','CNVS','🎨',339289,0.0000032306719999999995,0.0000060728,6.181303,2.892908,87.97,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_luna_02','tok_canvas','CanvasDAO','CNVS','🎨',371108,0.0000032306719999999995,0.0000060728,6.760994,3.164209,87.97,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_lucia_20','tok_canvas','CanvasDAO','CNVS','🎨',739559,0.0000032306719999999995,0.0000060728,13.473582,6.305764,87.97,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_jake_09','tok_yolo','YoloCoin','YOLO','🎲',2893711,0.000023289311999999997,0.000047008799999999996,408.089645,205.912030,101.85,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_val_16','tok_yolo','YoloCoin','YOLO','🎲',1387784,0.000023289311999999997,0.000047008799999999996,195.714181,98.752578,101.85,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_lucia_20','tok_yolo','YoloCoin','YOLO','🎲',1326169,0.000023289311999999997,0.000047008799999999996,187.024840,94.368149,101.85,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_tomas_13','tok_yolo','YoloCoin','YOLO','🎲',890134,0.000023289311999999997,0.000047008799999999996,125.532394,63.340568,101.85,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_sofia_04','tok_yolo','YoloCoin','YOLO','🎲',535432,0.000023289311999999997,0.000047008799999999996,75.510047,38.100519,101.85,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_elena_08','tok_yolo','YoloCoin','YOLO','🎲',2062092,0.000023289311999999997,0.000047008799999999996,290.809411,146.735299,101.85,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_nina_10','tok_zen','ZenToken','ZEN','🧘',1437355,0.000006197328,0.0000121272,52.293275,25.569994,95.68,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_sofia_04','tok_zen','ZenToken','ZEN','🧘',130561,0.000006197328,0.0000121272,4.750018,2.322630,95.68,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_diego_05','tok_zen','ZenToken','ZEN','🧘',939868,0.000006197328,0.0000121272,34.193902,16.719891,95.68,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_anna_12','tok_zen','ZenToken','ZEN','🧘',557283,0.000006197328,0.0000121272,20.274847,9.913851,95.68,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_nina_10','tok_chaos','ChaosDAO','CHAOS','🌀',3438582,0.0000139848,0.00002802,289.047203,144.783558,100.36,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_luna_02','tok_chaos','ChaosDAO','CHAOS','🌀',1373695,0.0000139848,0.00002802,115.472802,57.840252,100.36,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_anna_12','tok_chaos','ChaosDAO','CHAOS','🌀',1661042,0.0000139848,0.00002802,139.627191,69.939170,100.36,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_lucia_20','tok_chaos','ChaosDAO','CHAOS','🌀',1658016,0.0000139848,0.00002802,139.372825,69.811758,100.36,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_rafa_21','tok_chaos','ChaosDAO','CHAOS','🌀',1660518,0.0000139848,0.00002802,139.583143,69.917107,100.36,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_marco_17','tok_chaos','ChaosDAO','CHAOS','🌀',1104146,0.0000139848,0.00002802,92.814513,46.490730,100.36,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_diego_05','tok_chaos','ChaosDAO','CHAOS','🌀',907453,0.0000139848,0.00002802,76.280499,38.208853,100.36,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_pablo_11','tok_mate','MateCoin','MATE','🧉',650002,0.0000035425079999999998,0.0000067092,13.082980,6.175068,89.39,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_iris_14','tok_mate','MateCoin','MATE','🧉',365234,0.0000035425079999999998,0.0000067092,7.351284,3.469751,89.39,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_pgonia_01','tok_mate','MateCoin','MATE','🧉',282179,0.0000035425079999999998,0.0000067092,5.679586,2.680722,89.39,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_luna_02','tok_mate','MateCoin','MATE','🧉',342095,0.0000035425079999999998,0.0000067092,6.885551,3.249928,89.39,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_sara_18','tok_mate','MateCoin','MATE','🧉',191901,0.0000035425079999999998,0.0000067092,3.862507,1.823074,89.39,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_jake_09','tok_mate','MateCoin','MATE','🧉',341195,0.0000035425079999999998,0.0000067092,6.867436,3.241378,89.39,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_leo_15','tok_mate','MateCoin','MATE','🧉',432921,0.0000035425079999999998,0.0000067092,8.713661,4.112782,89.39,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_pablo_11','tok_fomo','FomoCoin','FOMO','😱',1698737,0.000027882571999999996,0.0000563828,287.338646,145.243175,102.22,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_leo_15','tok_fomo','FomoCoin','FOMO','😱',1751671,0.000027882571999999996,0.0000563828,296.292347,149.769069,102.22,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_elena_08','tok_fomo','FomoCoin','FOMO','😱',2411759,0.000027882571999999996,0.0000563828,407.945176,206.207044,102.22,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_val_16','tok_fomo','FomoCoin','FOMO','😱',817257,0.000027882571999999996,0.0000563828,138.237714,69.876033,102.22,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_luna_02','tok_fomo','FomoCoin','FOMO','😱',1978761,0.000027882571999999996,0.0000563828,334.704257,169.185419,102.22,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_tomas_13','tok_fomo','FomoCoin','FOMO','😱',639335,0.000027882571999999996,0.0000563828,108.142492,54.663580,102.22,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_anna_12','tok_hodl','HodlForever','HODL','🫡',1302793,0.000028851792,0.00005836079999999999,228.096125,115.332387,102.28,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_max_03','tok_hodl','HodlForever','HODL','🫡',353765,0.000028851792,0.00005836079999999999,61.938025,31.317763,102.28,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_luna_02','tok_hodl','HodlForever','HODL','🫡',1594458,0.000028851792,0.00005836079999999999,279.161533,141.152622,102.28,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_tomas_13','tok_hodl','HodlForever','HODL','🫡',949028,0.000028851792,0.00005836079999999999,166.158100,84.014625,102.28,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_sara_18','tok_hodl','HodlForever','HODL','🫡',1615937,0.000028851792,0.00005836079999999999,282.922128,143.054094,102.28,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_tomas_13','tok_devtool','DevTools','DEVT','🛠️',300572,9.12972e-7,0.0000013428,1.210824,0.387583,47.08,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_pgonia_01','tok_devtool','DevTools','DEVT','🛠️',118382,9.12972e-7,0.0000013428,0.476890,0.152652,47.08,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_leo_15','tok_devtool','DevTools','DEVT','🛠️',94742,9.12972e-7,0.0000013428,0.381659,0.122168,47.08,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_rafa_21','tok_devtool','DevTools','DEVT','🛠️',119333,9.12972e-7,0.0000013428,0.480721,0.153878,47.08,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_dan_19','tok_devtool','DevTools','DEVT','🛠️',199270,9.12972e-7,0.0000013428,0.802739,0.256955,47.08,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_luna_02','tok_devtool','DevTools','DEVT','🛠️',305058,9.12972e-7,0.0000013428,1.228896,0.393367,47.08,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_max_03','tok_devtool','DevTools','DEVT','🛠️',144412,9.12972e-7,0.0000013428,0.581749,0.186217,47.08,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_mia_06','tok_devtool','DevTools','DEVT','🛠️',196040,9.12972e-7,0.0000013428,0.789728,0.252790,47.08,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_tomas_13','tok_debug','DebugCoin','DBUG','🐛',184414,5.33712e-7,5.688e-7,0.314684,0.019412,6.57,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_val_16','tok_debug','DebugCoin','DBUG','🐛',22474,5.33712e-7,5.688e-7,0.038350,0.002366,6.57,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_dan_19','tok_debug','DebugCoin','DBUG','🐛',30547,5.33712e-7,5.688e-7,0.052125,0.003215,6.57,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_mia_06','tok_debug','DebugCoin','DBUG','🐛',20378,5.33712e-7,5.688e-7,0.034773,0.002145,6.57,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_rafa_21','tok_debug','DebugCoin','DBUG','🐛',27261,5.33712e-7,5.688e-7,0.046518,0.002870,6.57,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_diego_05','tok_debug','DebugCoin','DBUG','🐛',43236,5.33712e-7,5.688e-7,0.073778,0.004551,6.57,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_iris_14','tok_globe','GlobeToken','GLBE','🌍',3430897,0.0000108243,0.00002157,222.013345,110.602170,99.27,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_dan_19','tok_globe','GlobeToken','GLBE','🌍',276309,0.0000108243,0.00002157,17.879955,8.907401,99.27,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_pgonia_01','tok_globe','GlobeToken','GLBE','🌍',797284,0.0000108243,0.00002157,51.592248,25.702124,99.27,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_pablo_11','tok_globe','GlobeToken','GLBE','🌍',1182145,0.0000108243,0.00002157,76.496603,38.108927,99.27,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_anna_12','tok_globe','GlobeToken','GLBE','🌍',1560631,0.0000108243,0.00002157,100.988432,50.310218,99.27,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_rafa_21','tok_globe','GlobeToken','GLBE','🌍',653784,0.0000108243,0.00002157,42.306363,21.076100,99.27,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_carlos_07','tok_globe','GlobeToken','GLBE','🌍',1186096,0.0000108243,0.00002157,76.752272,38.236295,99.27,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_luna_02','tok_globe','GlobeToken','GLBE','🌍',535313,0.0000108243,0.00002157,34.640104,17.256939,99.27,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_leo_15','tok_rocket','RocketFuel','RKTF','🚀',4909568,0.000035021087999999996,0.00007095119999999999,1045.019223,529.203984,102.60,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_mia_06','tok_rocket','RocketFuel','RKTF','🚀',1181680,0.000035021087999999996,0.00007095119999999999,251.524842,127.373684,102.60,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_elena_08','tok_rocket','RocketFuel','RKTF','🚀',1134951,0.000035021087999999996,0.00007095119999999999,241.578406,122.336750,102.60,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_sara_18','tok_rocket','RocketFuel','RKTF','🚀',2185403,0.000035021087999999996,0.00007095119999999999,465.170896,235.565324,102.60,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_pgonia_01','tok_rocket','RocketFuel','RKTF','🚀',2866015,0.000035021087999999996,0.00007095119999999999,610.041610,308.928720,102.60,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_luna_02','tok_rocket','RocketFuel','RKTF','🚀',2682924,0.000035021087999999996,0.00007095119999999999,571.070032,289.193279,102.60,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_nina_10','tok_rocket','RocketFuel','RKTF','🚀',1030534,0.000035021087999999996,0.00007095119999999999,219.352872,111.081606,102.60,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_leo_15','tok_pump','PumpItUp','PUMP','💪',2994575,0.000008599308,0.0000170292,152.985650,75.731832,98.03,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_iris_14','tok_pump','PumpItUp','PUMP','💪',1023296,0.000008599308,0.0000170292,52.277737,25.878824,98.03,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_max_03','tok_pump','PumpItUp','PUMP','💪',1332076,0.000008599308,0.0000170292,68.052566,33.687770,98.03,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_luna_02','tok_pump','PumpItUp','PUMP','💪',670175,0.000008599308,0.0000170292,34.237632,16.948509,98.03,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_jake_09','tok_pump','PumpItUp','PUMP','💪',517604,0.000008599308,0.0000170292,26.443146,13.090037,98.03,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_sara_18','tok_pump','PumpItUp','PUMP','💪',655667,0.000008599308,0.0000170292,33.496453,16.581606,98.03,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_val_16','tok_pump','PumpItUp','PUMP','💪',515931,0.000008599308,0.0000170292,26.357677,13.047728,98.03,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_val_16','tok_brick','BrickByBrick','BRCK','🧱',388542,0.0000021518879999999998,0.0000038712,4.512371,2.004075,79.90,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_tomas_13','tok_brick','BrickByBrick','BRCK','🧱',73467,0.0000021518879999999998,0.0000038712,0.853216,0.378938,79.90,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_jake_09','tok_brick','BrickByBrick','BRCK','🧱',259170,0.0000021518879999999998,0.0000038712,3.009897,1.336782,79.90,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_carlos_07','tok_brick','BrickByBrick','BRCK','🧱',89297,0.0000021518879999999998,0.0000038712,1.037060,0.460588,79.90,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_rafa_21','tok_brick','BrickByBrick','BRCK','🧱',605749,0.0000021518879999999998,0.0000038712,7.034927,3.124415,79.90,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_marco_17','tok_banana','BananaCoin','BNNA','🍌',2497226,0.000016083371999999996,0.0000323028,242.002176,121.510732,100.85,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_iris_14','tok_banana','BananaCoin','BNNA','🍌',238865,0.000016083371999999996,0.0000323028,23.148025,11.622761,100.85,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_luna_02','tok_banana','BananaCoin','BNNA','🍌',675188,0.000016083371999999996,0.0000323028,65.431389,32.853489,100.85,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_max_03','tok_banana','BananaCoin','BNNA','🍌',666203,0.000016083371999999996,0.0000323028,64.560667,32.416295,100.85,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_lucia_20','tok_banana','BananaCoin','BNNA','🍌',379032,0.000016083371999999996,0.0000323028,36.731385,18.443047,100.85,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_marco_17','tok_jungle','JungleDAO','JNGL','🌴',524585,0.0000011826679999999999,0.0000018932,2.979433,1.118203,60.08,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_pgonia_01','tok_jungle','JungleDAO','JNGL','🌴',106038,0.0000011826679999999999,0.0000018932,0.602253,0.226030,60.08,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_nina_10','tok_jungle','JungleDAO','JNGL','🌴',85879,0.0000011826679999999999,0.0000018932,0.487758,0.183059,60.08,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_lucia_20','tok_jungle','JungleDAO','JNGL','🌴',261596,0.0000011826679999999999,0.0000018932,1.485761,0.557617,60.08,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_anna_12','tok_jungle','JungleDAO','JNGL','🌴',154575,0.0000011826679999999999,0.0000018932,0.877924,0.329491,60.08,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_elena_08','tok_jungle','JungleDAO','JNGL','🌴',334639,0.0000011826679999999999,0.0000018932,1.900616,0.713315,60.08,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_diego_05','tok_jungle','JungleDAO','JNGL','🌴',366891,0.0000011826679999999999,0.0000018932,2.083794,0.782063,60.08,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_luna_02','tok_jungle','JungleDAO','JNGL','🌴',364123,0.0000011826679999999999,0.0000018932,2.068073,0.776163,60.08,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_sara_18','tok_gem','HiddenGem','HGEM','💠',537928,0.000001519788,0.0000025812,4.165499,1.712890,69.84,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_pgonia_01','tok_gem','HiddenGem','HGEM','💠',197816,0.000001519788,0.0000025812,1.531808,0.629893,69.84,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_luna_02','tok_gem','HiddenGem','HGEM','💠',471959,0.000001519788,0.0000025812,3.654662,1.502829,69.84,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_dan_19','tok_gem','HiddenGem','HGEM','💠',77749,0.000001519788,0.0000025812,0.602057,0.247571,69.84,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_iris_14','tok_gem','HiddenGem','HGEM','💠',227205,0.000001519788,0.0000025812,1.759385,0.723474,69.84,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_dan_19','tok_orbit','OrbitDAO','ORBT','🪐',3458098,0.000012037932,0.000024046799999999998,249.468573,124.583527,99.76,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_leo_15','tok_orbit','OrbitDAO','ORBT','🪐',1576611,0.000012037932,0.000024046799999999998,113.737348,56.799940,99.76,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_anna_12','tok_orbit','OrbitDAO','ORBT','🪐',732755,0.000012037932,0.000024046799999999998,52.861239,26.398674,99.76,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_nina_10','tok_orbit','OrbitDAO','ORBT','🪐',1653296,0.000012037932,0.000024046799999999998,119.269435,59.562640,99.76,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_sofia_04','tok_orbit','OrbitDAO','ORBT','🪐',386926,0.000012037932,0.000024046799999999998,27.912996,13.939630,99.76,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_val_16','tok_orbit','OrbitDAO','ORBT','🪐',1055602,0.000012037932,0.000024046799999999998,76.151551,38.029755,99.76,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_lucia_20','tok_bag','BagHolder','BAGS','💰',3517857,0.00002157,0.0000435,459.080339,231.439812,101.67,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_sofia_04','tok_bag','BagHolder','BAGS','💰',310286,0.00002157,0.0000435,40.492323,20.413716,101.67,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_jake_09','tok_bag','BagHolder','BAGS','💰',1670802,0.00002157,0.0000435,218.039661,109.922064,101.67,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_rafa_21','tok_bag','BagHolder','BAGS','💰',2172428,0.00002157,0.0000435,283.501854,142.924038,101.67,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_anna_12','tok_bag','BagHolder','BAGS','💰',1220057,0.00002157,0.0000435,159.217439,80.267550,101.67,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_max_03','tok_bag','BagHolder','BAGS','💰',1417870,0.00002157,0.0000435,185.032035,93.281667,101.67,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_luna_02','tok_bag','BagHolder','BAGS','💰',1908674,0.00002157,0.0000435,249.081957,125.571662,101.67,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_nina_10','tok_bag','BagHolder','BAGS','💰',1763280,0.00002157,0.0000435,230.108040,116.006191,101.67,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_lucia_20','tok_stack','StackSats','STAK','📚',239697,6.34848e-7,7.752e-7,0.557439,0.100926,22.11,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_pablo_11','tok_stack','StackSats','STAK','📚',107429,6.34848e-7,7.752e-7,0.249837,0.045234,22.11,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_sofia_04','tok_stack','StackSats','STAK','📚',124936,6.34848e-7,7.752e-7,0.290551,0.052605,22.11,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_elena_08','tok_stack','StackSats','STAK','📚',67083,6.34848e-7,7.752e-7,0.156008,0.028246,22.11,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_val_16','tok_stack','StackSats','STAK','📚',110919,6.34848e-7,7.752e-7,0.257953,0.046703,22.11,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_dan_19','tok_stack','StackSats','STAK','📚',120291,6.34848e-7,7.752e-7,0.279749,0.050649,22.11,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_leo_15','tok_stack','StackSats','STAK','📚',164229,6.34848e-7,7.752e-7,0.381931,0.069150,22.11,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_carlos_07','tok_stack','StackSats','STAK','📚',30833,6.34848e-7,7.752e-7,0.071705,0.012982,22.11,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_rafa_21','tok_whale','WhaleAlert','WHAL','🐋',5558791,0.000040625707999999995,0.0000823892,1373.953030,696.463570,102.80,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_mia_06','tok_whale','WhaleAlert','WHAL','🐋',1912794,0.000040625707999999995,0.0000823892,472.780702,239.654871,102.80,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_lucia_20','tok_whale','WhaleAlert','WHAL','🐋',1344488,0.000040625707999999995,0.0000823892,332.313872,168.451541,102.80,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_max_03','tok_whale','WhaleAlert','WHAL','🐋',1721010,0.000040625707999999995,0.0000823892,425.377911,215.626162,102.80,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_anna_12','tok_whale','WhaleAlert','WHAL','🐋',2615331,0.000040625707999999995,0.0000823892,646.425086,327.676066,102.80,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_sofia_04','tok_whale','WhaleAlert','WHAL','🐋',1833975,0.000040625707999999995,0.0000823892,453.299199,229.779601,102.80,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_pablo_11','tok_whale','WhaleAlert','WHAL','🐋',2225074,0.000040625707999999995,0.0000823892,549.966200,278.780581,102.80,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_rafa_21','tok_shrimp','ShrimpCoin','SHRP','🦐',1406388,0.0000026575679999999997,0.0000049032,20.687405,9.474690,84.50,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_sofia_04','tok_shrimp','ShrimpCoin','SHRP','🦐',262732,0.0000026575679999999997,0.0000049032,3.864683,1.769998,84.50,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_elena_08','tok_shrimp','ShrimpCoin','SHRP','🦐',157626,0.0000026575679999999997,0.0000049032,2.318615,1.061910,84.50,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_iris_14','tok_shrimp','ShrimpCoin','SHRP','🦐',122303,0.0000026575679999999997,0.0000049032,1.799028,0.823943,84.50,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_leo_15','tok_shrimp','ShrimpCoin','SHRP','🦐',311748,0.0000026575679999999997,0.0000049032,4.585688,2.100214,84.50,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_sara_18','tok_shrimp','ShrimpCoin','SHRP','🦐',705205,0.0000026575679999999997,0.0000049032,10.373283,4.750893,84.50,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_anna_12','tok_shrimp','ShrimpCoin','SHRP','🦐',94109,0.0000026575679999999997,0.0000049032,1.384306,0.634003,84.50,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  INSERT INTO holdings (user_id,token_id,token_name,token_symbol,token_emoji,amount,avg_buy_price,current_price,value,pnl,pnl_percent,updated_at)
  VALUES ('usr_tomas_13','tok_shrimp','ShrimpCoin','SHRP','🦐',624472,0.0000026575679999999997,0.0000049032,9.185733,4.207003,84.50,now())
  ON CONFLICT (user_id,token_id) DO UPDATE SET amount=EXCLUDED.amount,current_price=EXCLUDED.current_price,value=EXCLUDED.value;
  
-- 4. ACTIVITY
INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_pgonia_01','pgonia','tok_wpepe','WPEPE',45000000,0.000035329999999999995,5,now()-interval '2 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_elena_08','elena_nft','tok_wpepe','WPEPE',185679,0.000035329999999999995,11.6202,now()-interval '30 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_max_03','max_alpha','tok_wpepe','WPEPE',357700,0.000035329999999999995,1.6176,now()-interval '13 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_leo_15','leo_pump','tok_wpepe','WPEPE',456477,0.000035329999999999995,6.7247,now()-interval '33 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_elena_08','elena_nft','tok_wpepe','WPEPE',162289,0.000035329999999999995,3.5896,now()-interval '10 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_leo_15','leo_pump','tok_wpepe','WPEPE',386125,0.000035329999999999995,10.8963,now()-interval '26 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_rafa_21','rafa_whale','tok_wpepe','WPEPE',80080,0.000035329999999999995,5.7597,now()-interval '44 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_pgonia_01','pgonia','tok_mdust','MDUST',12000000,0.0000029767999999999996,5,now()-interval '7 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_pablo_11','pablo_sol','tok_mdust','MDUST',71786,0.0000029767999999999996,13.0699,now()-interval '61 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_val_16','val_builder','tok_mdust','MDUST',182101,0.0000029767999999999996,10.5868,now()-interval '84 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_marco_17','marco_ape','tok_mdust','MDUST',22525,0.0000029767999999999996,2.4808,now()-interval '54 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_mia_06','mia_crypto','tok_mdust','MDUST',381196,0.0000029767999999999996,5.0594,now()-interval '5 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_rafa_21','rafa_whale','tok_mdust','MDUST',425114,0.0000029767999999999996,0.6013,now()-interval '52 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_max_03','max_alpha','tok_mdust','MDUST',471178,0.0000029767999999999996,2.2076,now()-interval '141 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_leo_15','leo_pump','tok_mdust','MDUST',176365,0.0000029767999999999996,9.3562,now()-interval '38 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_pgonia_01','pgonia','tok_orbcoin','ORBC',62000000,0.0000666168,5,now()-interval '20 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_elena_08','elena_nft','tok_orbcoin','ORBC',178813,0.0000666168,15.1879,now()-interval '262 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_iris_14','iris_world','tok_orbcoin','ORBC',260632,0.0000666168,8.4804,now()-interval '292 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_max_03','max_alpha','tok_orbcoin','ORBC',485744,0.0000666168,3.4393,now()-interval '406 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_pgonia_01','pgonia','tok_hyperh','HYPH',3500000,7.107e-7,5,now()-interval '19 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_diego_05','diego_wld','tok_hyperh','HYPH',361022,7.107e-7,4.4541,now()-interval '173 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_nina_10','nina_degen','tok_hyperh','HYPH',108637,7.107e-7,4.9857,now()-interval '213 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_carlos_07','carlos_moon','tok_hyperh','HYPH',201044,7.107e-7,5.0392,now()-interval '275 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_jake_09','jake_diamond','tok_hyperh','HYPH',52560,7.107e-7,9.8954,now()-interval '123 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_marco_17','marco_ape','tok_hyperh','HYPH',437845,7.107e-7,6.3150,now()-interval '49 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_diego_05','diego_wld','tok_hyperh','HYPH',85694,7.107e-7,1.7789,now()-interval '213 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_pgonia_01','pgonia','tok_dhand','DHAND',28000000,0.0000139848,5,now()-interval '8 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_leo_15','leo_pump','tok_dhand','DHAND',43315,0.0000139848,3.1047,now()-interval '78 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_pablo_11','pablo_sol','tok_dhand','DHAND',495178,0.0000139848,3.3936,now()-interval '157 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_pgonia_01','pgonia','tok_dhand','DHAND',120115,0.0000139848,1.0383,now()-interval '150 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_luna_02','luna_trader','tok_dhand','DHAND',402860,0.0000139848,9.9948,now()-interval '163 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_carlos_07','carlos_moon','tok_dhand','DHAND',117167,0.0000139848,5.3537,now()-interval '149 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_luna_02','luna_trader','tok_solara','SOLAR',55000000,0.00005253,5,now()-interval '19 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_sara_18','sara_gem','tok_solara','SOLAR',196255,0.00005253,2.6225,now()-interval '111 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_dan_19','dan_orbit','tok_solara','SOLAR',51395,0.00005253,4.4834,now()-interval '283 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_diego_05','diego_wld','tok_solara','SOLAR',460280,0.00005253,1.3610,now()-interval '161 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_carlos_07','carlos_moon','tok_solara','SOLAR',19241,0.00005253,1.3871,now()-interval '339 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_elena_08','elena_nft','tok_solara','SOLAR',333967,0.00005253,4.3924,now()-interval '209 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_elena_08','elena_nft','tok_solara','SOLAR',482439,0.00005253,0.7466,now()-interval '11 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_marco_17','marco_ape','tok_solara','SOLAR',308474,0.00005253,12.0799,now()-interval '300 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_luna_02','luna_trader','tok_nocturne','NOCT',8000000,0.0000016008,5,now()-interval '3 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_dan_19','dan_orbit','tok_nocturne','NOCT',158110,0.0000016008,9.1096,now()-interval '21 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_sofia_04','sofia.eth','tok_nocturne','NOCT',259973,0.0000016008,2.6064,now()-interval '49 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_dan_19','dan_orbit','tok_nocturne','NOCT',253044,0.0000016008,2.4267,now()-interval '68 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_iris_14','iris_world','tok_nocturne','NOCT',32521,0.0000016008,5.6130,now()-interval '23 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_max_03','max_alpha','tok_alpha','ALPHA',38000000,0.000025336799999999998,5,now()-interval '27 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_iris_14','iris_world','tok_alpha','ALPHA',63211,0.000025336799999999998,14.1424,now()-interval '34 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_val_16','val_builder','tok_alpha','ALPHA',343311,0.000025336799999999998,10.7407,now()-interval '310 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_mia_06','mia_crypto','tok_alpha','ALPHA',369614,0.000025336799999999998,4.3574,now()-interval '323 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_carlos_07','carlos_moon','tok_alpha','ALPHA',139473,0.000025336799999999998,12.1762,now()-interval '270 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_max_03','max_alpha','tok_apex','APEX',15000000,0.0000043700000000000005,5,now()-interval '21 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_elena_08','elena_nft','tok_apex','APEX',115927,0.0000043700000000000005,15.2673,now()-interval '138 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_carlos_07','carlos_moon','tok_apex','APEX',394892,0.0000043700000000000005,7.5657,now()-interval '443 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_val_16','val_builder','tok_apex','APEX',492711,0.0000043700000000000005,2.3558,now()-interval '451 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_rafa_21','rafa_whale','tok_apex','APEX',220634,0.0000043700000000000005,12.6883,now()-interval '134 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_sofia_04','sofia.eth','tok_rosa','ROSA',22000000,0.0000088248,5,now()-interval '13 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_tomas_13','tomas_dev','tok_rosa','ROSA',91569,0.0000088248,6.7764,now()-interval '70 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_diego_05','diego_wld','tok_rosa','ROSA',159593,0.0000088248,3.3977,now()-interval '200 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_diego_05','diego_wld','tok_rosa','ROSA',504407,0.0000088248,6.7157,now()-interval '71 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_carlos_07','carlos_moon','tok_rosa','ROSA',60861,0.0000088248,4.4803,now()-interval '54 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_iris_14','iris_world','tok_rosa','ROSA',288096,0.0000088248,3.7112,now()-interval '153 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_diego_05','diego_wld','tok_fuego','FUEG',67000000,0.0000777108,5,now()-interval '11 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_mia_06','mia_crypto','tok_fuego','FUEG',391844,0.0000777108,2.4133,now()-interval '5 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_marco_17','marco_ape','tok_fuego','FUEG',328123,0.0000777108,10.2188,now()-interval '185 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_mia_06','mia_crypto','tok_fuego','FUEG',480820,0.0000777108,5.4286,now()-interval '79 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_anna_12','anna_hodl','tok_fuego','FUEG',276954,0.0000777108,10.4773,now()-interval '152 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_marco_17','marco_ape','tok_fuego','FUEG',493149,0.0000777108,5.9182,now()-interval '179 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_luna_02','luna_trader','tok_fuego','FUEG',99351,0.0000777108,6.2421,now()-interval '57 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_diego_05','diego_wld','tok_hielo','ICE',5000000,9.3e-7,5,now()-interval '24 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_nina_10','nina_degen','tok_hielo','ICE',193525,9.3e-7,5.8001,now()-interval '27 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_mia_06','mia_crypto','tok_hielo','ICE',435347,9.3e-7,6.5536,now()-interval '499 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_anna_12','anna_hodl','tok_hielo','ICE',324678,9.3e-7,3.7544,now()-interval '317 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_elena_08','elena_nft','tok_hielo','ICE',236122,9.3e-7,8.2245,now()-interval '397 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_val_16','val_builder','tok_hielo','ICE',279858,9.3e-7,5.2580,now()-interval '492 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_mia_06','mia_crypto','tok_pixel','PIXL',33000000,0.0000192308,5,now()-interval '7 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_rafa_21','rafa_whale','tok_pixel','PIXL',180932,0.0000192308,9.3879,now()-interval '40 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_diego_05','diego_wld','tok_pixel','PIXL',235774,0.0000192308,1.1568,now()-interval '15 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_mia_06','mia_crypto','tok_pixel','PIXL',14829,0.0000192308,15.1831,now()-interval '104 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_rafa_21','rafa_whale','tok_pixel','PIXL',138549,0.0000192308,5.6181,now()-interval '116 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_nina_10','nina_degen','tok_pixel','PIXL',469013,0.0000192308,4.6335,now()-interval '87 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_elena_08','elena_nft','tok_pixel','PIXL',308155,0.0000192308,13.3447,now()-interval '76 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_mia_06','mia_crypto','tok_vibe','VIBE',21000000,0.000008085199999999998,5,now()-interval '15 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_sara_18','sara_gem','tok_vibe','VIBE',416329,0.000008085199999999998,13.5792,now()-interval '115 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_elena_08','elena_nft','tok_vibe','VIBE',488640,0.000008085199999999998,12.0943,now()-interval '248 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_nina_10','nina_degen','tok_vibe','VIBE',33222,0.000008085199999999998,10.0866,now()-interval '188 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_leo_15','leo_pump','tok_vibe','VIBE',218563,0.000008085199999999998,13.6750,now()-interval '112 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_lucia_20','lucia_bag','tok_vibe','VIBE',64258,0.000008085199999999998,7.3955,now()-interval '146 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_carlos_07','carlos_moon','tok_luna','LNAO',42000000,0.0000308408,5,now()-interval '19 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_tomas_13','tomas_dev','tok_luna','LNAO',198883,0.0000308408,9.0054,now()-interval '115 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_val_16','val_builder','tok_luna','LNAO',335917,0.0000308408,13.8392,now()-interval '278 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_rafa_21','rafa_whale','tok_luna','LNAO',474469,0.0000308408,10.8680,now()-interval '75 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_val_16','val_builder','tok_luna','LNAO',60017,0.0000308408,7.4747,now()-interval '393 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_pgonia_01','pgonia','tok_luna','LNAO',485637,0.0000308408,3.4440,now()-interval '242 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_tomas_13','tomas_dev','tok_luna','LNAO',16437,0.0000308408,10.9856,now()-interval '335 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_tomas_13','tomas_dev','tok_luna','LNAO',307507,0.0000308408,11.8797,now()-interval '300 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_marco_17','marco_ape','tok_luna','LNAO',160787,0.0000308408,5.0171,now()-interval '240 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_carlos_07','carlos_moon','tok_crater','CRTR',1500000,5.387e-7,5,now()-interval '12 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_dan_19','dan_orbit','tok_crater','CRTR',147536,5.387e-7,5.8458,now()-interval '44 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_val_16','val_builder','tok_crater','CRTR',508803,5.387e-7,2.3987,now()-interval '199 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_max_03','max_alpha','tok_crater','CRTR',44152,5.387e-7,5.6345,now()-interval '154 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_sara_18','sara_gem','tok_crater','CRTR',498162,5.387e-7,8.5160,now()-interval '221 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_pablo_11','pablo_sol','tok_crater','CRTR',189126,5.387e-7,13.0629,now()-interval '275 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_val_16','val_builder','tok_crater','CRTR',130936,5.387e-7,3.9187,now()-interval '269 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_carlos_07','carlos_moon','tok_crater','CRTR',93344,5.387e-7,8.1191,now()-interval '62 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_carlos_07','carlos_moon','tok_crater','CRTR',337543,5.387e-7,13.6967,now()-interval '140 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_elena_08','elena_nft','tok_nftape','ANFT',48000000,0.000040128799999999994,5,now()-interval '15 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_val_16','val_builder','tok_nftape','ANFT',247839,0.000040128799999999994,3.2844,now()-interval '51 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_marco_17','marco_ape','tok_nftape','ANFT',383121,0.000040128799999999994,11.0965,now()-interval '90 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_iris_14','iris_world','tok_nftape','ANFT',257390,0.000040128799999999994,13.6137,now()-interval '171 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_rafa_21','rafa_whale','tok_nftape','ANFT',236400,0.000040128799999999994,8.3895,now()-interval '265 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_anna_12','anna_hodl','tok_nftape','ANFT',310829,0.000040128799999999994,11.8751,now()-interval '151 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_leo_15','leo_pump','tok_nftape','ANFT',416859,0.000040128799999999994,8.7491,now()-interval '319 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_elena_08','elena_nft','tok_canvas','CNVS',18000000,0.0000060728,5,now()-interval '11 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_anna_12','anna_hodl','tok_canvas','CNVS',74763,0.0000060728,2.7335,now()-interval '253 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_luna_02','luna_trader','tok_canvas','CNVS',94523,0.0000060728,7.4287,now()-interval '112 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_val_16','val_builder','tok_canvas','CNVS',273586,0.0000060728,4.3526,now()-interval '171 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_jake_09','jake_diamond','tok_yolo','YOLO',52000000,0.000047008799999999996,5,now()-interval '28 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_carlos_07','carlos_moon','tok_yolo','YOLO',252662,0.000047008799999999996,5.2881,now()-interval '356 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_iris_14','iris_world','tok_yolo','YOLO',502792,0.000047008799999999996,11.1771,now()-interval '126 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_luna_02','luna_trader','tok_yolo','YOLO',144940,0.000047008799999999996,8.5252,now()-interval '5 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_diego_05','diego_wld','tok_yolo','YOLO',244584,0.000047008799999999996,13.8080,now()-interval '355 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_iris_14','iris_world','tok_yolo','YOLO',54418,0.000047008799999999996,5.9507,now()-interval '25 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_elena_08','elena_nft','tok_yolo','YOLO',187990,0.000047008799999999996,6.5017,now()-interval '322 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_nina_10','nina_degen','tok_zen','ZEN',26000000,0.0000121272,5,now()-interval '13 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_max_03','max_alpha','tok_zen','ZEN',299006,0.0000121272,3.8813,now()-interval '176 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_tomas_13','tomas_dev','tok_zen','ZEN',287199,0.0000121272,11.1820,now()-interval '14 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_nina_10','nina_degen','tok_zen','ZEN',133466,0.0000121272,0.9632,now()-interval '23 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_pgonia_01','pgonia','tok_zen','ZEN',465339,0.0000121272,1.6458,now()-interval '153 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_pablo_11','pablo_sol','tok_zen','ZEN',163937,0.0000121272,4.7111,now()-interval '290 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_anna_12','anna_hodl','tok_zen','ZEN',114608,0.0000121272,10.2665,now()-interval '95 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_nina_10','nina_degen','tok_chaos','CHAOS',40000000,0.00002802,5,now()-interval '8 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_marco_17','marco_ape','tok_chaos','CHAOS',300117,0.00002802,13.3053,now()-interval '10 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_elena_08','elena_nft','tok_chaos','CHAOS',215954,0.00002802,7.3449,now()-interval '56 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_rafa_21','rafa_whale','tok_chaos','CHAOS',431800,0.00002802,12.9961,now()-interval '134 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_anna_12','anna_hodl','tok_chaos','CHAOS',106301,0.00002802,10.6853,now()-interval '154 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_iris_14','iris_world','tok_chaos','CHAOS',315849,0.00002802,3.8289,now()-interval '99 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_nina_10','nina_degen','tok_chaos','CHAOS',57708,0.00002802,11.0585,now()-interval '99 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_nina_10','nina_degen','tok_chaos','CHAOS',493879,0.00002802,0.8811,now()-interval '25 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_luna_02','luna_trader','tok_chaos','CHAOS',387297,0.00002802,1.9109,now()-interval '51 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_pablo_11','pablo_sol','tok_mate','MATE',19000000,0.0000067092,5,now()-interval '25 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_mia_06','mia_crypto','tok_mate','MATE',208817,0.0000067092,14.7483,now()-interval '259 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_pgonia_01','pgonia','tok_mate','MATE',494084,0.0000067092,12.6074,now()-interval '254 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_mia_06','mia_crypto','tok_mate','MATE',246054,0.0000067092,5.9219,now()-interval '482 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_pgonia_01','pgonia','tok_mate','MATE',25823,0.0000067092,8.5616,now()-interval '276 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_carlos_07','carlos_moon','tok_mate','MATE',48542,0.0000067092,11.6527,now()-interval '125 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_sara_18','sara_gem','tok_mate','MATE',424891,0.0000067092,5.5010,now()-interval '21 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_pablo_11','pablo_sol','tok_fomo','FOMO',57000000,0.0000563828,5,now()-interval '20 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_val_16','val_builder','tok_fomo','FOMO',82774,0.0000563828,4.7424,now()-interval '85 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_iris_14','iris_world','tok_fomo','FOMO',484691,0.0000563828,0.5552,now()-interval '161 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_lucia_20','lucia_bag','tok_fomo','FOMO',145080,0.0000563828,9.1002,now()-interval '422 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_sara_18','sara_gem','tok_fomo','FOMO',174002,0.0000563828,7.6521,now()-interval '298 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_nina_10','nina_degen','tok_fomo','FOMO',383176,0.0000563828,7.2923,now()-interval '343 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_diego_05','diego_wld','tok_fomo','FOMO',350958,0.0000563828,15.4022,now()-interval '342 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_marco_17','marco_ape','tok_fomo','FOMO',261804,0.0000563828,13.1355,now()-interval '355 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_anna_12','anna_hodl','tok_hodl','HODL',58000000,0.00005836079999999999,5,now()-interval '28 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_val_16','val_builder','tok_hodl','HODL',196830,0.00005836079999999999,8.4773,now()-interval '544 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_nina_10','nina_degen','tok_hodl','HODL',201148,0.00005836079999999999,2.5750,now()-interval '309 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_val_16','val_builder','tok_hodl','HODL',398324,0.00005836079999999999,14.1552,now()-interval '198 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_tomas_13','tomas_dev','tok_devtool','DEVT',7000000,0.0000013428,5,now()-interval '10 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_sofia_04','sofia.eth','tok_devtool','DEVT',338215,0.0000013428,8.8125,now()-interval '68 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_max_03','max_alpha','tok_devtool','DEVT',505976,0.0000013428,12.1106,now()-interval '118 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_pgonia_01','pgonia','tok_devtool','DEVT',364762,0.0000013428,14.1369,now()-interval '128 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_luna_02','luna_trader','tok_devtool','DEVT',385271,0.0000013428,3.7263,now()-interval '207 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_dan_19','dan_orbit','tok_devtool','DEVT',467327,0.0000013428,6.0068,now()-interval '82 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_diego_05','diego_wld','tok_devtool','DEVT',11150,0.0000013428,3.9565,now()-interval '74 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_anna_12','anna_hodl','tok_devtool','DEVT',263639,0.0000013428,8.2584,now()-interval '26 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_anna_12','anna_hodl','tok_devtool','DEVT',151441,0.0000013428,12.5266,now()-interval '182 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_tomas_13','tomas_dev','tok_debug','DBUG',2000000,5.688e-7,5,now()-interval '24 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_pablo_11','pablo_sol','tok_debug','DBUG',110809,5.688e-7,8.0596,now()-interval '312 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_anna_12','anna_hodl','tok_debug','DBUG',497296,5.688e-7,4.5869,now()-interval '231 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_luna_02','luna_trader','tok_debug','DBUG',163732,5.688e-7,6.5054,now()-interval '493 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_marco_17','marco_ape','tok_debug','DBUG',405911,5.688e-7,1.7739,now()-interval '544 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_jake_09','jake_diamond','tok_debug','DBUG',405965,5.688e-7,5.8035,now()-interval '167 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_elena_08','elena_nft','tok_debug','DBUG',323961,5.688e-7,13.9214,now()-interval '265 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_carlos_07','carlos_moon','tok_debug','DBUG',192822,5.688e-7,10.8008,now()-interval '391 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_rafa_21','rafa_whale','tok_debug','DBUG',338597,5.688e-7,1.7205,now()-interval '274 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_iris_14','iris_world','tok_globe','GLBE',35000000,0.00002157,5,now()-interval '8 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_sara_18','sara_gem','tok_globe','GLBE',260485,0.00002157,8.3474,now()-interval '28 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_carlos_07','carlos_moon','tok_globe','GLBE',344776,0.00002157,9.9709,now()-interval '59 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_iris_14','iris_world','tok_globe','GLBE',228338,0.00002157,3.3873,now()-interval '69 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_sara_18','sara_gem','tok_globe','GLBE',249961,0.00002157,8.9711,now()-interval '106 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_sara_18','sara_gem','tok_globe','GLBE',38291,0.00002157,6.2297,now()-interval '93 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_sara_18','sara_gem','tok_globe','GLBE',471026,0.00002157,5.1878,now()-interval '125 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_val_16','val_builder','tok_globe','GLBE',34339,0.00002157,15.4561,now()-interval '83 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_diego_05','diego_wld','tok_globe','GLBE',105969,0.00002157,6.5342,now()-interval '41 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_leo_15','leo_pump','tok_rocket','RKTF',64000000,0.00007095119999999999,5,now()-interval '23 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_rafa_21','rafa_whale','tok_rocket','RKTF',253349,0.00007095119999999999,8.1897,now()-interval '5 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_max_03','max_alpha','tok_rocket','RKTF',337690,0.00007095119999999999,13.2827,now()-interval '436 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_val_16','val_builder','tok_rocket','RKTF',222686,0.00007095119999999999,8.7163,now()-interval '233 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_pgonia_01','pgonia','tok_rocket','RKTF',58195,0.00007095119999999999,6.2943,now()-interval '467 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_val_16','val_builder','tok_rocket','RKTF',127144,0.00007095119999999999,4.3667,now()-interval '107 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_leo_15','leo_pump','tok_pump','PUMP',31000000,0.0000170292,5,now()-interval '9 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_dan_19','dan_orbit','tok_pump','PUMP',301879,0.0000170292,1.5056,now()-interval '15 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_carlos_07','carlos_moon','tok_pump','PUMP',356345,0.0000170292,1.1715,now()-interval '20 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_sofia_04','sofia.eth','tok_pump','PUMP',38633,0.0000170292,7.3168,now()-interval '109 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_val_16','val_builder','tok_pump','PUMP',401612,0.0000170292,2.7131,now()-interval '189 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_rafa_21','rafa_whale','tok_pump','PUMP',172589,0.0000170292,5.1273,now()-interval '46 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_leo_15','leo_pump','tok_pump','PUMP',502154,0.0000170292,13.0028,now()-interval '71 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_val_16','val_builder','tok_brick','BRCK',14000000,0.0000038712,5,now()-interval '2 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_carlos_07','carlos_moon','tok_brick','BRCK',26951,0.0000038712,4.5366,now()-interval '33 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_jake_09','jake_diamond','tok_brick','BRCK',374020,0.0000038712,11.1848,now()-interval '22 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_sofia_04','sofia.eth','tok_brick','BRCK',500399,0.0000038712,11.6303,now()-interval '5 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_pablo_11','pablo_sol','tok_brick','BRCK',429928,0.0000038712,10.7768,now()-interval '6 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_val_16','val_builder','tok_brick','BRCK',55734,0.0000038712,3.7616,now()-interval '41 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_luna_02','luna_trader','tok_brick','BRCK',96891,0.0000038712,2.0691,now()-interval '46 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_pablo_11','pablo_sol','tok_brick','BRCK',120743,0.0000038712,7.5829,now()-interval '33 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_marco_17','marco_ape','tok_banana','BNNA',43000000,0.0000323028,5,now()-interval '17 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_rafa_21','rafa_whale','tok_banana','BNNA',424271,0.0000323028,11.1673,now()-interval '245 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_jake_09','jake_diamond','tok_banana','BNNA',282691,0.0000323028,8.2633,now()-interval '17 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_pgonia_01','pgonia','tok_banana','BNNA',49566,0.0000323028,12.2094,now()-interval '353 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_marco_17','marco_ape','tok_jungle','JNGL',9000000,0.0000018932,5,now()-interval '4 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_leo_15','leo_pump','tok_jungle','JNGL',369721,0.0000018932,2.6443,now()-interval '75 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_sara_18','sara_gem','tok_jungle','JNGL',65993,0.0000018932,12.8305,now()-interval '38 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_carlos_07','carlos_moon','tok_jungle','JNGL',378428,0.0000018932,11.5055,now()-interval '18 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_luna_02','luna_trader','tok_jungle','JNGL',413247,0.0000018932,1.9940,now()-interval '66 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_leo_15','leo_pump','tok_jungle','JNGL',70049,0.0000018932,5.7040,now()-interval '25 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_leo_15','leo_pump','tok_jungle','JNGL',311614,0.0000018932,14.3587,now()-interval '89 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_val_16','val_builder','tok_jungle','JNGL',465562,0.0000018932,6.0121,now()-interval '5 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_pgonia_01','pgonia','tok_jungle','JNGL',274654,0.0000018932,14.7481,now()-interval '58 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_sara_18','sara_gem','tok_gem','HGEM',11000000,0.0000025812,5,now()-interval '26 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_elena_08','elena_nft','tok_gem','HGEM',383477,0.0000025812,6.7857,now()-interval '194 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_lucia_20','lucia_bag','tok_gem','HGEM',340736,0.0000025812,15.2876,now()-interval '34 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_leo_15','leo_pump','tok_gem','HGEM',295696,0.0000025812,8.5125,now()-interval '578 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_leo_15','leo_pump','tok_gem','HGEM',327569,0.0000025812,5.6172,now()-interval '522 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_rafa_21','rafa_whale','tok_gem','HGEM',47149,0.0000025812,2.2565,now()-interval '226 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_sofia_04','sofia.eth','tok_gem','HGEM',260520,0.0000025812,15.0199,now()-interval '174 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_diego_05','diego_wld','tok_gem','HGEM',388618,0.0000025812,4.0306,now()-interval '496 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_carlos_07','carlos_moon','tok_gem','HGEM',386093,0.0000025812,9.7648,now()-interval '479 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_dan_19','dan_orbit','tok_orbit','ORBT',37000000,0.000024046799999999998,5,now()-interval '2 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_iris_14','iris_world','tok_orbit','ORBT',320592,0.000024046799999999998,12.5906,now()-interval '26 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_pgonia_01','pgonia','tok_orbit','ORBT',16927,0.000024046799999999998,1.8439,now()-interval '18 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_anna_12','anna_hodl','tok_orbit','ORBT',48418,0.000024046799999999998,2.1427,now()-interval '19 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_val_16','val_builder','tok_orbit','ORBT',460790,0.000024046799999999998,1.8356,now()-interval '38 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_sofia_04','sofia.eth','tok_orbit','ORBT',505443,0.000024046799999999998,10.0741,now()-interval '36 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_leo_15','leo_pump','tok_orbit','ORBT',66136,0.000024046799999999998,8.2108,now()-interval '23 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_luna_02','luna_trader','tok_orbit','ORBT',430961,0.000024046799999999998,10.7705,now()-interval '23 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_val_16','val_builder','tok_orbit','ORBT',489559,0.000024046799999999998,15.3741,now()-interval '33 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_lucia_20','lucia_bag','tok_bag','BAGS',50000000,0.0000435,5,now()-interval '2 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_luna_02','luna_trader','tok_bag','BAGS',495831,0.0000435,14.7474,now()-interval '6 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_sofia_04','sofia.eth','tok_bag','BAGS',211502,0.0000435,8.4550,now()-interval '38 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_iris_14','iris_world','tok_bag','BAGS',502656,0.0000435,12.7696,now()-interval '25 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_luna_02','luna_trader','tok_bag','BAGS',122251,0.0000435,4.0985,now()-interval '35 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_lucia_20','lucia_bag','tok_stack','STAK',4000000,7.752e-7,5,now()-interval '16 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_carlos_07','carlos_moon','tok_stack','STAK',39512,7.752e-7,14.5535,now()-interval '4 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_dan_19','dan_orbit','tok_stack','STAK',272544,7.752e-7,8.9077,now()-interval '290 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_anna_12','anna_hodl','tok_stack','STAK',299633,7.752e-7,11.4374,now()-interval '335 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_nina_10','nina_degen','tok_stack','STAK',368002,7.752e-7,2.7853,now()-interval '4 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_rafa_21','rafa_whale','tok_stack','STAK',483252,7.752e-7,6.9377,now()-interval '134 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_marco_17','marco_ape','tok_stack','STAK',488343,7.752e-7,5.9115,now()-interval '119 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_carlos_07','carlos_moon','tok_stack','STAK',203909,7.752e-7,11.6283,now()-interval '304 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_rafa_21','rafa_whale','tok_whale','WHAL',69000000,0.0000823892,5,now()-interval '8 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_dan_19','dan_orbit','tok_whale','WHAL',450272,0.0000823892,10.8144,now()-interval '23 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_carlos_07','carlos_moon','tok_whale','WHAL',395550,0.0000823892,13.5828,now()-interval '157 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_marco_17','marco_ape','tok_whale','WHAL',42353,0.0000823892,15.4063,now()-interval '56 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_lucia_20','lucia_bag','tok_whale','WHAL',122170,0.0000823892,8.2840,now()-interval '56 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_luna_02','luna_trader','tok_whale','WHAL',62463,0.0000823892,0.8983,now()-interval '15 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_dan_19','dan_orbit','tok_whale','WHAL',292457,0.0000823892,3.3543,now()-interval '38 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_pablo_11','pablo_sol','tok_whale','WHAL',224095,0.0000823892,2.9115,now()-interval '1 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('create','usr_rafa_21','rafa_whale','tok_shrimp','SHRP',16000000,0.0000049032,5,now()-interval '2 days');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_nina_10','nina_degen','tok_shrimp','SHRP',454109,0.0000049032,9.0500,now()-interval '14 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_jake_09','jake_diamond','tok_shrimp','SHRP',344389,0.0000049032,6.6204,now()-interval '18 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_carlos_07','carlos_moon','tok_shrimp','SHRP',283291,0.0000049032,10.9329,now()-interval '3 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_rafa_21','rafa_whale','tok_shrimp','SHRP',303257,0.0000049032,1.0997,now()-interval '47 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_elena_08','elena_nft','tok_shrimp','SHRP',161746,0.0000049032,12.2680,now()-interval '38 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('buy','usr_carlos_07','carlos_moon','tok_shrimp','SHRP',461894,0.0000049032,10.8274,now()-interval '18 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_marco_17','marco_ape','tok_shrimp','SHRP',301069,0.0000049032,13.7385,now()-interval '28 hours');
  INSERT INTO token_activity (type,user_id,username,token_id,token_symbol,amount,price,total,timestamp)
  VALUES ('sell','usr_iris_14','iris_world','tok_shrimp','SHRP',390000,0.0000049032,12.9345,now()-interval '33 hours');
  
-- 5. PRICE SNAPSHOTS
INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_wpepe',5.03483e-7,0.0000015104489999999998,450000,44.34,'trade',now()-interval '48 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_wpepe',0.000001566668479100017,0.000004700005437300051,7874999,16.10,'trade',now()-interval '40 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_wpepe',0.0000045263474736800174,0.000013579042421040052,15299999,31.61,'trade',now()-interval '32 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_wpepe',0.00000938252075,0.000028147562250000003,22725000,13.41,'trade',now()-interval '24 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_wpepe',0.000016135185962840013,0.000048405557888520044,30149999,9.39,'trade',now()-interval '16 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_wpepe',0.00002478434675,0.00007435304025,37575000,54.20,'trade',now()-interval '7 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mdust',5.002476799999999e-7,0.0000015007430399999997,120000,2.62,'trade',now()-interval '168 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mdust',5.080875034644912e-7,0.0000015242625103934736,685714,2.57,'trade',now()-interval '160 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mdust',5.269364390739647e-7,0.0000015808093172218942,1251428,0.01,'trade',now()-interval '152 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mdust',5.567944868284208e-7,0.0000016703834604852625,1817142,1.11,'trade',now()-interval '144 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mdust',5.976617286981227e-7,0.0000017929851860943682,2382857,5.27,'trade',now()-interval '136 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mdust',6.495380202031051e-7,0.0000019486140606093153,2948571,10.35,'trade',now()-interval '128 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mdust',7.1242342385307e-7,0.00000213727027155921,3514285,3.16,'trade',now()-interval '120 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mdust',7.863179396480172e-7,0.000002358953818944052,4079999,7.22,'trade',now()-interval '112 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mdust',8.712217274004911e-7,0.0000026136651822014733,4645714,0.36,'trade',now()-interval '104 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mdust',9.671344869459647e-7,0.000002901403460837894,5211428,4.66,'trade',now()-interval '96 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mdust',0.0000010740563586364206,0.000003222169075909262,5777142,3.44,'trade',now()-interval '88 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mdust',0.0000011919875606661228,0.0000035759626819983683,6342857,2.27,'trade',now()-interval '80 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mdust',0.0000013209276761071051,0.0000039627830283213154,6908571,3.21,'trade',now()-interval '72 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mdust',0.00000146087690369307,0.00000438263071107921,7474285,3.54,'trade',now()-interval '64 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mdust',0.000001611835243424017,0.000004835505730272051,8039999,3.16,'trade',now()-interval '56 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mdust',0.0000017738029913364913,0.000005321408974009474,8605714,8.24,'trade',now()-interval '48 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mdust',0.000001946779574817965,0.0000058403387244538946,9171428,9.14,'trade',now()-interval '40 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mdust',0.000002130765270444421,0.0000063922958113332625,9737142,5.75,'trade',now()-interval '32 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mdust',0.0000023257604326341226,0.000006977281297902368,10302857,10.45,'trade',now()-interval '24 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mdust',0.000002531764372011105,0.000007595293116033315,10868571,6.16,'trade',now()-interval '16 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mdust',0.00000274877742353307,0.00000824633227059921,11434285,8.25,'trade',now()-interval '8 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',5.0661168e-7,0.0000015198350399999999,620000,236.74,'trade',now()-interval '480 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',5.798401683e-7,0.0000017395205049,2154500,97.18,'trade',now()-interval '468 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',7.340700012e-7,0.0000022022100036,3689000,94.72,'trade',now()-interval '456 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',9.693009990116172e-7,0.0000029079029970348515,5223499,176.52,'trade',now()-interval '444 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.0000012855337007999998,0.000003856601102399999,6758000,97.46,'trade',now()-interval '432 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.0000016827675674999997,0.0000050483027025,8292500,235.47,'trade',now()-interval '420 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.0000021610027788,0.0000064830083364,9827000,121.57,'trade',now()-interval '408 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.0000027202393347,0.0000081607180041,11361500,16.80,'trade',now()-interval '396 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.0000033604772352,0.0000100814317056,12896000,105.65,'trade',now()-interval '384 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.0000040817164802999995,0.000012245149440899998,14430500,100.53,'trade',now()-interval '372 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.00000488395707,0.000014651871209999998,15965000,122.51,'trade',now()-interval '360 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.000005767199004299999,0.0000173015970129,17499500,40.70,'trade',now()-interval '348 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.0000067314422832,0.0000201943268496,19034000,27.21,'trade',now()-interval '336 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.0000077766869067,0.000023330060720099998,20568500,84.39,'trade',now()-interval '324 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.0000089029328748,0.0000267087986244,22103000,237.34,'trade',now()-interval '312 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.0000101101801875,0.000030330540562499998,23637500,136.11,'trade',now()-interval '300 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.0000113984288448,0.0000341952865344,25172000,34.87,'trade',now()-interval '288 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.0000127676788467,0.0000383030365401,26706500,99.62,'trade',now()-interval '276 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.0000142179301932,0.000042653790579599995,28241000,123.63,'trade',now()-interval '264 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.000015749182884299997,0.00004724754865289999,29775500,131.28,'trade',now()-interval '252 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.00001736143692,0.00005208431075999999,31310000,212.24,'trade',now()-interval '240 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.000019054692300299997,0.00005716407690089999,32844500,123.58,'trade',now()-interval '228 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.000020828949025199996,0.00006248684707559998,34379000,82.20,'trade',now()-interval '216 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.000022684205859275615,0.00006805261757782684,35913499,145.79,'trade',now()-interval '204 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.000024620466508799996,0.00007386139952639999,37448000,213.75,'trade',now()-interval '192 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.000026637727267499996,0.00007991318180249998,38982500,221.95,'trade',now()-interval '180 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.000028735989370799996,0.00008620796811239999,40517000,262.71,'trade',now()-interval '168 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.0000309152528187,0.0000927457584561,42051500,118.88,'trade',now()-interval '155 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.000033175517611199995,0.00009952655283359998,43586000,42.30,'trade',now()-interval '144 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.000035516783748299994,0.00010655035124489999,45120500,147.78,'trade',now()-interval '132 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.000037939051229999996,0.00011381715368999999,46655000,110.34,'trade',now()-interval '120 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.000040442320056299995,0.00012132696016889998,48189500,17.54,'trade',now()-interval '108 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.00004302659022719999,0.00012907977068159996,49724000,25.68,'trade',now()-interval '95 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.00004569186174269999,0.0001370755852281,51258500,8.10,'trade',now()-interval '84 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.0000484381346028,0.0001453144038084,52793000,67.38,'trade',now()-interval '72 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.000051265408807499996,0.0001537962264225,54327500,51.70,'trade',now()-interval '60 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.0000541736843568,0.00016252105307040001,55862000,258.27,'trade',now()-interval '47 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.000057162961250699995,0.00017148888375209998,57396500,252.53,'trade',now()-interval '35 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.0000602332394892,0.00018069971846760002,58931000,89.95,'trade',now()-interval '24 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbcoin',0.0000633845190723,0.0001901535572169,60465500,228.81,'trade',now()-interval '12 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',5.0002107e-7,0.00000150006321,35000,2.24,'trade',now()-interval '456 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',5.0025443341875e-7,0.0000015007633002562499,121625,1.33,'trade',now()-interval '444 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',5.00745930675e-7,0.000001502237792025,208250,0.36,'trade',now()-interval '433 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',5.014955516250672e-7,0.0000015044866548752015,294874,0.27,'trade',now()-interval '421 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',5.025033266999999e-7,0.0000015075099800999998,381500,3.23,'trade',now()-interval '410 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',5.0376922546875e-7,0.0000015113076764062499,468125,0.88,'trade',now()-interval '399 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',5.05293258075e-7,0.0000015158797742249998,554750,0.68,'trade',now()-interval '387 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',5.0707542451875e-7,0.0000015212262735562498,641375,1.92,'trade',now()-interval '376 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',5.091157248e-7,0.0000015273471743999999,728000,0.70,'trade',now()-interval '364 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',5.1141415891875e-7,0.0000015342424767562498,814625,2.25,'trade',now()-interval '353 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',5.139707268749999e-7,0.000001541912180625,901250,2.92,'trade',now()-interval '342 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',5.1678542866875e-7,0.00000155035628600625,987875,1.24,'trade',now()-interval '330 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',5.198582643e-7,0.0000015595747929,1074500,3.12,'trade',now()-interval '319 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',5.2318923376875e-7,0.00000156956770130625,1161125,3.56,'trade',now()-interval '307 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',5.26778337075e-7,0.0000015803350112249999,1247750,2.98,'trade',now()-interval '296 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',5.306255742187499e-7,0.0000015918767226562498,1334375,3.02,'trade',now()-interval '285 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',5.347309452e-7,0.0000016041928356,1421000,0.98,'trade',now()-interval '273 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',5.3909445001875e-7,0.0000016172833500562499,1507625,0.28,'trade',now()-interval '262 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',5.43716088675e-7,0.000001631148266025,1594250,1.13,'trade',now()-interval '250 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',5.4859586116875e-7,0.00000164578758350625,1680875,3.06,'trade',now()-interval '239 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',5.537337675e-7,0.0000016612013025,1767500,3.48,'trade',now()-interval '228 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',5.5912980766875e-7,0.00000167738942300625,1854125,0.76,'trade',now()-interval '216 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',5.64783981675e-7,0.000001694351945025,1940750,0.49,'trade',now()-interval '205 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',5.706962197770672e-7,0.0000017120886593312017,2027374,3.37,'trade',now()-interval '193 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',5.768667312e-7,0.0000017306001936,2114000,3.21,'trade',now()-interval '182 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',5.832953067187499e-7,0.0000017498859201562498,2200625,2.53,'trade',now()-interval '171 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',5.89982016075e-7,0.0000017699460482249999,2287250,1.21,'trade',now()-interval '159 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',5.9692685926875e-7,0.00000179078057780625,2373875,2.25,'trade',now()-interval '148 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',6.041298363e-7,0.0000018123895088999999,2460500,1.90,'trade',now()-interval '136 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',6.1159094716875e-7,0.00000183477284150625,2547125,0.93,'trade',now()-interval '125 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',6.19310191875e-7,0.000001857930575625,2633750,1.48,'trade',now()-interval '114 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',6.272875704187499e-7,0.0000018818627112562498,2720375,2.44,'trade',now()-interval '102 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',6.355230827999999e-7,0.0000019065692483999998,2807000,1.25,'trade',now()-interval '91 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',6.4401672901875e-7,0.00000193205018705625,2893625,0.45,'trade',now()-interval '79 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',6.527685090749999e-7,0.0000019583055272249997,2980250,0.74,'trade',now()-interval '68 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',6.617784229687499e-7,0.0000019853352689062498,3066875,1.81,'trade',now()-interval '57 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',6.710464707e-7,0.0000020131394121,3153500,0.36,'trade',now()-interval '45 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',6.8057265226875e-7,0.0000020417179568062498,3240125,2.63,'trade',now()-interval '34 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',6.90356967675e-7,0.0000020710709030249997,3326750,0.57,'trade',now()-interval '22 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hyperh',7.0039941691875e-7,0.0000021011982507562498,3413375,2.74,'trade',now()-interval '11 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_dhand',5.0134848e-7,0.00000150404544,280000,37.30,'trade',now()-interval '192 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_dhand',5.3541867e-7,0.0000016062560099999999,1435000,30.34,'trade',now()-interval '184 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_dhand',6.153792309040172e-7,0.0000018461376927120516,2589999,33.51,'trade',now()-interval '176 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_dhand',7.4123043e-7,0.00000222369129,3745000,30.79,'trade',now()-interval '168 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_dhand',9.12972e-7,0.0000027389159999999997,4900000,29.78,'trade',now()-interval '160 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_dhand',0.0000011306040299999998,0.0000033918120899999995,6055000,27.22,'trade',now()-interval '152 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_dhand',0.00000139412652,0.00000418237956,7210000,7.07,'trade',now()-interval '144 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_dhand',0.0000017035394700000001,0.00000511061841,8365000,26.12,'trade',now()-interval '136 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_dhand',0.00000205884288,0.000006176528640000001,9520000,22.89,'trade',now()-interval '128 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_dhand',0.00000246003675,0.0000073801102499999996,10675000,45.14,'trade',now()-interval '120 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_dhand',0.00000290712108,0.000008721363239999999,11830000,35.98,'trade',now()-interval '111 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_dhand',0.0000034000958699999995,0.000010200287609999998,12985000,40.02,'trade',now()-interval '104 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_dhand',0.00000393896112,0.000011816883360000001,14140000,33.11,'trade',now()-interval '96 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_dhand',0.00000452371683,0.00001357115049,15295000,29.62,'trade',now()-interval '88 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_dhand',0.000005154363000000001,0.000015463089,16450000,45.76,'trade',now()-interval '80 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_dhand',0.000005830899629999999,0.00001749269889,17605000,0.46,'trade',now()-interval '72 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_dhand',0.000006553326074656017,0.000019659978223968052,18759999,39.72,'trade',now()-interval '64 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_dhand',0.00000732164427,0.00002196493281,19915000,32.01,'trade',now()-interval '55 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_dhand',0.00000813585228,0.00002440755684,21070000,27.65,'trade',now()-interval '48 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_dhand',0.00000899595075,0.00002698785225,22225000,11.56,'trade',now()-interval '40 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_dhand',0.00000990193968,0.00002970581904,23380000,4.42,'trade',now()-interval '31 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_dhand',0.00001085381907,0.00003256145721,24535000,8.75,'trade',now()-interval '24 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_dhand',0.00001185158892,0.00003555476676,25690000,13.58,'trade',now()-interval '16 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_dhand',0.00001289524923,0.00003868574769,26845000,0.50,'trade',now()-interval '7 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',5.05203e-7,0.000001515609,550000,13.97,'trade',now()-interval '456 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',5.62829476875e-7,0.000001688488430625,1911250,132.34,'trade',now()-interval '444 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',6.841992075e-7,0.0000020525976225,3272500,80.40,'trade',now()-interval '433 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',8.69312191875e-7,0.000002607936575625,4633750,81.27,'trade',now()-interval '421 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.00000111816843,0.00000335450529,5995000,71.68,'trade',now()-interval '410 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.0000014307679218749998,0.000004292303765625,7356250,35.24,'trade',now()-interval '399 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.0000018071106675,0.0000054213320025,8717500,86.75,'trade',now()-interval '387 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.0000022471966668749997,0.0000067415900006249995,10078750,73.26,'trade',now()-interval '376 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.0000027510259199999996,0.000008253077759999998,11440000,134.14,'trade',now()-interval '364 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.0000033185984268749997,0.000009955795280624999,12801250,47.03,'trade',now()-interval '353 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.0000039499141875,0.0000118497425625,14162500,115.44,'trade',now()-interval '342 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.000004644973201875,0.000013934919605625001,15523750,124.67,'trade',now()-interval '330 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.00000540377547,0.00001621132641,16885000,17.37,'trade',now()-interval '319 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.000006226320991875,0.000018678962975625,18246250,114.70,'trade',now()-interval '307 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.0000071126097675,0.0000213378293025,19607500,66.25,'trade',now()-interval '296 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.000008062641796874999,0.000024187925390624996,20968750,11.31,'trade',now()-interval '285 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.00000907641708,0.000027229251240000002,22330000,153.55,'trade',now()-interval '273 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.000010153935616875,0.000030461806850625,23691250,1.33,'trade',now()-interval '262 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.0000112951974075,0.0000338855922225,25052500,10.72,'trade',now()-interval '250 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.000012500202451875,0.000037500607355625,26413750,79.00,'trade',now()-interval '239 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.000013768950750000002,0.000041306852250000004,27775000,40.32,'trade',now()-interval '228 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.000015101442301875001,0.000045304326905625005,29136250,64.83,'trade',now()-interval '216 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.0000164976771075,0.0000494930313225,30497500,96.33,'trade',now()-interval '205 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.000017957654070934015,0.000053872962212802046,31858749,97.73,'trade',now()-interval '193 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.00001948137648,0.00005844412944,33220000,128.54,'trade',now()-interval '182 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.000021068841046875,0.000063206523140625,34581250,142.17,'trade',now()-interval '171 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.000022720048867499998,0.0000681601466025,35942500,100.32,'trade',now()-interval '159 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.000024434999941875,0.00007330499982562499,37303750,0.26,'trade',now()-interval '148 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.00002621369427,0.00007864108281,38665000,154.15,'trade',now()-interval '136 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.000028056131851875,0.000084168395555625,40026250,30.80,'trade',now()-interval '125 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.0000299623126875,0.0000898869380625,41387500,148.48,'trade',now()-interval '114 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.000031932236776875,0.00009579671033062501,42748750,20.05,'trade',now()-interval '102 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.00003396590412,0.00010189771236,44110000,116.56,'trade',now()-interval '91 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.000036063314716875,0.000108189944150625,45471250,74.71,'trade',now()-interval '79 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.0000382244685675,0.0001146734057025,46832500,147.17,'trade',now()-interval '68 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.000040449365671875,0.000121348097015625,48193750,39.12,'trade',now()-interval '57 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.00004273800603,0.00012821401809000001,49555000,136.03,'trade',now()-interval '45 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.000045090389641875,0.00013527116892562502,50916250,153.66,'trade',now()-interval '34 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.0000475065165075,0.0001425195495225,52277500,138.81,'trade',now()-interval '22 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_solara',0.000049986386626875,0.00014995915988062498,53638750,35.11,'trade',now()-interval '11 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nocturne',5.0011008e-7,0.00000150033024,80000,2.10,'trade',now()-interval '72 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nocturne',5.158514869760172e-7,0.0000015475544609280516,959999,5.44,'trade',now()-interval '64 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nocturne',5.582322567040172e-7,0.0000016746967701120516,1839999,3.16,'trade',now()-interval '56 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nocturne',6.272523864320172e-7,0.0000018817571592960516,2719999,5.16,'trade',now()-interval '48 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nocturne',7.229118761600172e-7,0.000002168735628480052,3599999,4.73,'trade',now()-interval '40 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nocturne',8.4521088e-7,0.00000253563264,4480000,0.17,'trade',now()-interval '32 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nocturne',9.94148935616017e-7,0.0000029824468068480513,5359999,2.21,'trade',now()-interval '24 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nocturne',0.00000116972672,0.00000350918016,6240000,5.54,'trade',now()-interval '16 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nocturne',0.0000013719434350720171,0.000004115830305216052,7119999,0.01,'trade',now()-interval '8 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',5.024836799999999e-7,0.0000015074510399999998,380000,79.56,'trade',now()-interval '648 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',5.299919883e-7,0.0000015899759649,1320500,88.61,'trade',now()-interval '631 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',5.879284811999999e-7,0.0000017637854435999998,2261000,89.36,'trade',now()-interval '615 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',6.762930485684171e-7,0.0000020288791457052513,3201499,1.95,'trade',now()-interval '599 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',7.950860207999999e-7,0.0000023852580624,4142000,72.52,'trade',now()-interval '583 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',9.443070675e-7,0.0000028329212025,5082500,91.58,'trade',now()-interval '567 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.0000011239562988,0.0000033718688964,6023000,23.51,'trade',now()-interval '550 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.0000013340337146999998,0.000004002101144099999,6963500,81.64,'trade',now()-interval '534 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.0000015745393152,0.0000047236179456,7904000,75.80,'trade',now()-interval '518 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.0000018454731002999998,0.0000055364193009,8844500,76.87,'trade',now()-interval '502 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.00000214683507,0.00000644050521,9785000,51.18,'trade',now()-interval '486 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.0000024786252243,0.0000074358756729,10725500,64.03,'trade',now()-interval '469 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.0000028408435632,0.000008522530689599999,11666000,20.88,'trade',now()-interval '453 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.0000032334900866999998,0.000009700470260099999,12606500,14.16,'trade',now()-interval '437 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.0000036565647947999996,0.000010969694384399999,13547000,78.05,'trade',now()-interval '421 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.0000041100676875,0.0000123302030625,14487500,36.87,'trade',now()-interval '405 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.0000045939987648,0.000013781996294400001,15428000,16.13,'trade',now()-interval '388 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.0000051083580267,0.000015325074080099998,16368500,31.36,'trade',now()-interval '372 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.0000056531454732,0.0000169594364196,17309000,15.75,'trade',now()-interval '356 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.0000062283611043,0.0000186850833129,18249500,17.74,'trade',now()-interval '340 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.00000683400492,0.00002050201476,19190000,36.33,'trade',now()-interval '324 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.0000074700769202999996,0.0000224102307609,20130500,47.21,'trade',now()-interval '307 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.0000081365771052,0.0000244097313156,21071000,68.08,'trade',now()-interval '291 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.000008833504717504417,0.00002650051415251325,22011499,18.09,'trade',now()-interval '275 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.000009560862028799999,0.000028682586086399997,22952000,55.41,'trade',now()-interval '259 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.0000103186467675,0.0000309559403025,23892500,66.06,'trade',now()-interval '243 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.0000111068596908,0.0000333205790724,24833000,75.91,'trade',now()-interval '226 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.0000119255007987,0.0000357765023961,25773500,92.79,'trade',now()-interval '210 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.000012774570091199998,0.00003832371027359999,26714000,81.51,'trade',now()-interval '194 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.000013654067568300002,0.0000409622027049,27654500,7.01,'trade',now()-interval '178 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.000014563992246332016,0.000043691976738996045,28594999,18.99,'trade',now()-interval '162 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.0000155043470763,0.00004651304122890001,29535500,47.24,'trade',now()-interval '145 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.0000164751291072,0.0000494253873216,30476000,81.26,'trade',now()-interval '129 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.000017476339322699997,0.00005242901796809999,31416500,81.11,'trade',now()-interval '113 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.000018507977722799997,0.00005552393316839999,32357000,38.16,'trade',now()-interval '97 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.000019570044307499998,0.00005871013292249999,33297500,62.96,'trade',now()-interval '81 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.000020662539076799997,0.00006198761723039998,34238000,85.37,'trade',now()-interval '64 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.000021785462030699997,0.0000653563860921,35178500,15.31,'trade',now()-interval '48 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.0000229388131692,0.00006881643950759999,36119000,84.45,'trade',now()-interval '32 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_alpha',0.000024122592492299997,0.00007236777747689999,37059500,84.63,'trade',now()-interval '16 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',5.00387e-7,0.000001501161,150000,7.94,'trade',now()-interval '504 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',5.04673266875e-7,0.0000015140198006249998,521250,0.89,'trade',now()-interval '491 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',5.137007674999999e-7,0.0000015411023024999998,892500,13.82,'trade',now()-interval '478 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',5.274694584020172e-7,0.0000015824083752060516,1263749,14.16,'trade',now()-interval '466 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',5.4597947e-7,0.00000163793841,1635000,9.45,'trade',now()-interval '453 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',5.692306718749999e-7,0.000001707692015625,2006250,13.21,'trade',now()-interval '441 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',5.972231075e-7,0.0000017916693225,2377500,16.46,'trade',now()-interval '428 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',6.29956776875e-7,0.0000018898703306249998,2748750,19.35,'trade',now()-interval '415 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',6.6743168e-7,0.00000200229504,3120000,13.24,'trade',now()-interval '403 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',7.096478168749999e-7,0.0000021289434506249997,3491250,7.56,'trade',now()-interval '390 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',7.566051874999999e-7,0.0000022698155624999995,3862500,10.18,'trade',now()-interval '378 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',8.083037918749999e-7,0.000002424911375625,4233750,0.58,'trade',now()-interval '365 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',8.6474363e-7,0.00000259423089,4605000,1.26,'trade',now()-interval '352 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',9.25924701875e-7,0.000002777774105625,4976250,0.89,'trade',now()-interval '340 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',9.918470075e-7,0.0000029755410225000002,5347500,11.31,'trade',now()-interval '327 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',0.000001062510546875,0.000003187531640625,5718750,10.15,'trade',now()-interval '315 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',0.0000011379153199999998,0.0000034137459599999995,6090000,8.61,'trade',now()-interval '302 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',0.0000012180613268749998,0.0000036541839806249994,6461250,9.20,'trade',now()-interval '289 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',0.0000013029485674999999,0.0000039088457025,6832500,13.22,'trade',now()-interval '277 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',0.000001392577041875,0.000004177731125625,7203750,1.84,'trade',now()-interval '264 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',0.00000148694675,0.00000446084025,7575000,16.98,'trade',now()-interval '252 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',0.0000015860576918749997,0.000004758173075625,7946250,16.37,'trade',now()-interval '239 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',0.0000016899098674999998,0.0000050697296025,8317500,16.26,'trade',now()-interval '226 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',0.0000017985029779820173,0.000005395508933946052,8688749,1.39,'trade',now()-interval '214 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',0.00000191183792,0.00000573551376,9060000,13.94,'trade',now()-interval '201 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',0.0000020299137968749998,0.000006089741390624999,9431250,6.28,'trade',now()-interval '189 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',0.0000021527309075,0.0000064581927225,9802500,9.01,'trade',now()-interval '176 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',0.000002280289251875,0.000006840867755624999,10173750,15.75,'trade',now()-interval '163 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',0.00000241258883,0.00000723776649,10545000,5.23,'trade',now()-interval '151 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',0.000002549629641875,0.000007648888925624999,10916250,6.38,'trade',now()-interval '138 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',0.0000026914116875,0.0000080742350625,11287500,0.44,'trade',now()-interval '126 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',0.000002837934966875,0.000008513804900625,11658750,0.95,'trade',now()-interval '113 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',0.0000029891994799999995,0.000008967598439999999,12030000,4.13,'trade',now()-interval '100 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',0.000003145205226875,0.000009435615680625,12401250,20.03,'trade',now()-interval '88 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',0.0000033059522074999995,0.000009917856622499998,12772500,17.56,'trade',now()-interval '75 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',0.0000034714404218749998,0.000010414321265625,13143750,3.20,'trade',now()-interval '63 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',0.00000364166987,0.00001092500961,13515000,5.22,'trade',now()-interval '50 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',0.000003816640551875,0.000011449921655625,13886250,15.39,'trade',now()-interval '37 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',0.0000039963524675,0.0000119890574025,14257500,2.73,'trade',now()-interval '25 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_apex',0.000004180805616875,0.000012542416850625001,14628750,11.53,'trade',now()-interval '12 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',5.0083248e-7,0.00000150249744,220000,9.28,'trade',now()-interval '312 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',5.104232262905612e-7,0.0000015312696788716837,778461,5.46,'trade',now()-interval '304 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',5.307426454563788e-7,0.0000015922279363691364,1336923,6.79,'trade',now()-interval '296 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',5.617906647282432e-7,0.0000016853719941847297,1895384,6.00,'trade',now()-interval '288 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',6.035673952975152e-7,0.0000018107021858925454,2453846,7.48,'trade',now()-interval '280 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',6.560726875506828e-7,0.0000019682180626520482,3012307,8.70,'trade',now()-interval '272 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',7.193067295234092e-7,0.0000021579201885702278,3570769,12.76,'trade',now()-interval '264 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',7.9326929475788e-7,0.00000237980788427364,4129230,2.78,'trade',now()-interval '256 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',8.779606481340608e-7,0.0000026338819444021823,4687692,0.58,'trade',now()-interval '248 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',9.733804863498348e-7,0.0000029201414590495044,5246153,3.02,'trade',now()-interval '240 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.0000010795291511294698,0.0000032385874533884094,5804615,2.40,'trade',now()-interval '232 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.000001196406262326547,0.000003589218786979641,6363076,10.43,'trade',now()-interval '224 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.000001324012238509637,0.000003972036715528911,6921538,8.89,'trade',now()-interval '216 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.0000014623466226880172,0.000004387039868064052,7479999,8.27,'trade',now()-interval '208 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.0000016114099102745612,0.000004834229730823684,8038461,9.35,'trade',now()-interval '199 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.0000017712018631683789,0.000005313605589505137,8596923,10.89,'trade',now()-interval '192 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.000001941722166424243,0.000005825166499272729,9155384,9.61,'trade',now()-interval '184 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.000002122971430721515,0.000006368914292164545,9713846,2.55,'trade',now()-interval '176 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.0000023149490069586826,0.000006944847020876048,10272307,12.88,'trade',now()-interval '168 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.000002517655582659409,0.000007552966747978227,10830769,9.77,'trade',now()-interval '160 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.00000273109043187788,0.00000819327129563364,11389230,2.09,'trade',now()-interval '152 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.0000029552543189820606,0.000008865762956946182,11947692,5.44,'trade',now()-interval '144 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.0000031901464411818346,0.000009570439323545504,12506153,5.34,'trade',now()-interval '136 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.00000343576763968947,0.00001030730291906841,13064615,0.56,'trade',now()-interval '128 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.0000036921170348705474,0.000011076351104611643,13623076,2.65,'trade',now()-interval '120 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.000003959195544781636,0.000011877586634344908,14181538,2.77,'trade',now()-interval '111 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.000004237002212944017,0.00001271100663883205,14739999,5.45,'trade',now()-interval '104 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.000004525538034258562,0.000013576614102775684,15298461,3.87,'trade',now()-interval '96 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.0000048248025208803796,0.000014474407562641138,15856923,11.83,'trade',now()-interval '88 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.000005134795108120243,0.00001540438532436073,16415384,0.24,'trade',now()-interval '80 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.000005455516906145515,0.000016366550718436544,16973846,13.20,'trade',now()-interval '71 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.000005786966766366683,0.000017360900299100048,17532307,10.97,'trade',now()-interval '64 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.00000612914587579541,0.00001838743762738623,18090769,8.76,'trade',now()-interval '56 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.00000648205300899788,0.00001944615902699364,18649230,6.33,'trade',now()-interval '48 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.000006845689429830061,0.000020537068289490182,19207692,3.17,'trade',now()-interval '40 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.000007220053836013835,0.000021660161508041505,19766153,0.69,'trade',now()-interval '31 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.00000760514756824947,0.00002281544270474841,20324615,3.28,'trade',now()-interval '23 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.000008000969247414546,0.00002400290774224364,20883076,0.59,'trade',now()-interval '16 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rosa',0.000008407520291053636,0.000025222560873160907,21441538,2.10,'trade',now()-interval '8 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',5.077210799999999e-7,0.0000015231632399999997,670000,315.18,'trade',now()-interval '264 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',6.2353728e-7,0.0000018706118399999999,2680000,212.65,'trade',now()-interval '256 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',8.783327586640171e-7,0.0000026349982759920513,4689999,145.89,'trade',now()-interval '248 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.000001272107769520017,0.000003816323308560051,6699999,17.70,'trade',now()-interval '240 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.0000018048625199999999,0.0000054145875599999996,8710000,308.54,'trade',now()-interval '232 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.0000024765964799999997,0.0000074297894399999985,10720000,307.02,'trade',now()-interval '224 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.0000032873098799999997,0.00000986192964,12730000,33.45,'trade',now()-interval '216 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.00000423700272,0.00001271100816,14740000,84.66,'trade',now()-interval '208 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.0000053256750000000005,0.000015977025,16750000,37.09,'trade',now()-interval '200 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.000006553326074656017,0.000019659978223968052,18759999,199.94,'trade',now()-interval '192 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.00000791995788,0.000023759873639999998,20770000,269.45,'trade',now()-interval '184 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.000009425567696368017,0.000028276703089104052,22779999,234.21,'trade',now()-interval '176 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.000011070158519999999,0.00003321047556,24790000,234.02,'trade',now()-interval '168 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.000012853727078080018,0.00003856118123424006,26799999,83.57,'trade',now()-interval '160 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.00001477627692,0.00004432883076,28810000,235.94,'trade',now()-interval '151 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.000016837804219792013,0.00005051341265937604,30819999,249.02,'trade',now()-interval '144 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.000019038313079999998,0.000057114939239999993,32830000,269.67,'trade',now()-interval '136 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.00002137780032,0.00006413340096,34840000,170.26,'trade',now()-interval '128 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.000023856265732360016,0.00007156879719708004,36849999,110.09,'trade',now()-interval '120 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.000026473713119999997,0.00007942113935999999,38860000,218.95,'trade',now()-interval '111 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.000029230138679999995,0.00008769041603999999,40870000,244.81,'trade',now()-interval '104 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.000032125543679999995,0.00009637663103999999,42880000,63.32,'trade',now()-interval '96 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.000035159926575784015,0.00010547977972735205,44889999,253.31,'trade',now()-interval '88 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.000038333292,0.000114999876,46900000,226.30,'trade',now()-interval '80 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.00004164563532,0.00012493690596,48910000,239.81,'trade',now()-interval '72 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.000045096958079999996,0.00013529087424,50920000,319.17,'trade',now()-interval '64 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.00004868725845920801,0.00014606177537762404,52929999,207.03,'trade',now()-interval '56 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.00005241654192,0.00015724962576,54940000,296.22,'trade',now()-interval '47 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.000056284802999999995,0.00016885440899999999,56950000,141.10,'trade',now()-interval '40 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.00006029204351999999,0.00018087613056,58960000,147.84,'trade',now()-interval '32 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.00006443826138263202,0.00019331478414789607,60969999,159.43,'trade',now()-interval '24 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.00006872346288,0.00020617038864,62980000,48.76,'trade',now()-interval '15 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fuego',0.00007314764172,0.00021944292516,64990000,28.41,'trade',now()-interval '7 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',5.00043e-7,0.000001500129,50000,2.15,'trade',now()-interval '576 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',5.005192518749999e-7,0.0000015015577556249997,173750,1.69,'trade',now()-interval '561 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',5.015223075e-7,0.0000015045669224999998,297500,1.60,'trade',now()-interval '547 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',5.030521523840172e-7,0.0000015091564571520515,421249,1.29,'trade',now()-interval '532 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',5.0510883e-7,0.0000015153264899999999,545000,2.21,'trade',now()-interval '518 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',5.07692296875e-7,0.0000015230768906249999,668750,0.77,'trade',now()-interval '504 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',5.108025675e-7,0.0000015324077024999999,792500,1.69,'trade',now()-interval '489 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',5.14439641875e-7,0.0000015433189256249998,916250,1.21,'trade',now()-interval '475 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',5.1860352e-7,0.0000015558105599999998,1040000,0.32,'trade',now()-interval '460 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',5.232942018749999e-7,0.0000015698826056249997,1163750,0.79,'trade',now()-interval '446 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',5.285116875e-7,0.0000015855350625,1287500,0.39,'trade',now()-interval '432 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',5.342559768749999e-7,0.0000016027679306249998,1411250,1.78,'trade',now()-interval '417 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',5.4052707e-7,0.00000162158121,1535000,1.52,'trade',now()-interval '403 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',5.473249668749999e-7,0.000001641974900625,1658750,0.16,'trade',now()-interval '388 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',5.546496675e-7,0.0000016639490025,1782500,2.17,'trade',now()-interval '374 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',5.62501171875e-7,0.0000016875035156249999,1906250,1.21,'trade',now()-interval '360 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',5.7087948e-7,0.00000171263844,2030000,1.56,'trade',now()-interval '345 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',5.79784591875e-7,0.0000017393537756250002,2153750,1.90,'trade',now()-interval '331 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',5.892165075e-7,0.0000017676495225,2277500,1.49,'trade',now()-interval '316 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',5.99175226875e-7,0.000001797525680625,2401250,0.67,'trade',now()-interval '302 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',6.0966075e-7,0.00000182898225,2525000,1.96,'trade',now()-interval '288 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',6.20673076875e-7,0.000001862019230625,2648750,2.09,'trade',now()-interval '273 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',6.322122074999999e-7,0.0000018966366224999998,2772500,0.46,'trade',now()-interval '259 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',6.442780422440172e-7,0.0000019328341267320515,2896249,1.25,'trade',now()-interval '244 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',6.568708799999999e-7,0.00000197061264,3020000,0.53,'trade',now()-interval '230 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',6.69990421875e-7,0.000002009971265625,3143750,0.54,'trade',now()-interval '216 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',6.836367674999999e-7,0.0000020509103024999998,3267500,0.38,'trade',now()-interval '201 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',6.97809916875e-7,0.000002093429750625,3391250,2.01,'trade',now()-interval '187 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',7.1250987e-7,0.00000213752961,3515000,2.06,'trade',now()-interval '172 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',7.27736626875e-7,0.000002183209880625,3638750,0.51,'trade',now()-interval '158 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',7.434900580700171e-7,0.000002230470174210051,3762499,2.38,'trade',now()-interval '144 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',7.59770551875e-7,0.000002279311655625,3886250,0.39,'trade',now()-interval '129 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',7.7657772e-7,0.00000232973316,4010000,0.24,'trade',now()-interval '115 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',7.93911691875e-7,0.000002381735075625,4133750,1.39,'trade',now()-interval '100 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',8.117724674999999e-7,0.0000024353174024999998,4257500,1.74,'trade',now()-interval '86 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',8.30160046875e-7,0.000002490480140625,4381250,2.25,'trade',now()-interval '72 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',8.490744299999999e-7,0.00000254722329,4505000,2.14,'trade',now()-interval '57 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',8.68515616875e-7,0.000002605546850625,4628750,2.21,'trade',now()-interval '43 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',8.884836074999999e-7,0.0000026654508225,4752500,1.52,'trade',now()-interval '28 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hielo',9.08978401875e-7,0.000002726935205625,4876250,0.95,'trade',now()-interval '14 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pixel',5.0187308e-7,0.00000150561924,330000,19.06,'trade',now()-interval '168 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pixel',5.611617773844912e-7,0.0000016834853321534737,1885714,31.69,'trade',now()-interval '160 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pixel',7.037069388819647e-7,0.000002111120816645894,3441428,29.77,'trade',now()-interval '152 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pixel',9.295085644924208e-7,0.0000027885256934772624,4997142,10.74,'trade',now()-interval '144 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pixel',0.0000012385668796341229,0.0000037157006389023686,6552857,14.03,'trade',now()-interval '136 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pixel',0.000001630881486987105,0.000004892644460961315,8108571,8.63,'trade',now()-interval '128 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pixel',0.00000210645255845307,0.00000631935767535921,9664285,41.91,'trade',now()-interval '120 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pixel',0.000002665280094032017,0.000007995840282096051,11219999,38.19,'trade',now()-interval '112 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pixel',0.000003307364533208491,0.000009922093599625474,12775714,33.34,'trade',now()-interval '104 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pixel',0.000004032705050529965,0.000012098115151589895,14331428,1.67,'trade',now()-interval '96 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pixel',0.000004841302031964421,0.000014523906095893262,15887142,1.06,'trade',now()-interval '88 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pixel',0.000005733156077546123,0.000017199468232638367,17442857,42.29,'trade',now()-interval '80 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pixel',0.0000067082660407231055,0.000020124798122169316,18998571,9.92,'trade',now()-interval '72 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pixel',0.00000776663246801307,0.00002329989740403921,20554285,33.77,'trade',now()-interval '64 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pixel',0.000008908255359416016,0.00002672476607824805,22109999,22.70,'trade',now()-interval '56 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pixel',0.000010133135529032491,0.000030399406587097474,23665714,32.66,'trade',now()-interval '48 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pixel',0.000011441271402177964,0.00003432381420653389,25221428,26.53,'trade',now()-interval '40 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pixel',0.000012832663739436421,0.00003849799121830926,26777142,18.23,'trade',now()-interval '32 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pixel',0.00001430731351545812,0.00004292194054637436,28332857,21.96,'trade',now()-interval '24 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pixel',0.000015865218834459103,0.00004759565650337731,29888571,31.71,'trade',now()-interval '16 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pixel',0.000017506380617573068,0.000052519141852719204,31444285,7.73,'trade',now()-interval '8 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',5.0075852e-7,0.00000150227556,210000,6.00,'trade',now()-interval '360 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',5.091596030749999e-7,0.0000015274788092249998,729750,12.29,'trade',now()-interval '351 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',5.268535043e-7,0.0000015805605129,1249500,0.77,'trade',now()-interval '342 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',5.538401628128172e-7,0.0000016615204884384515,1769249,5.26,'trade',now()-interval '333 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',5.901197612e-7,0.0000017703592836,2289000,14.21,'trade',now()-interval '324 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',6.35692116875e-7,0.0000019070763506249999,2808750,7.00,'trade',now()-interval '315 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',6.905572907e-7,0.0000020716718721,3328500,11.87,'trade',now()-interval '306 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',7.54715282675e-7,0.000002264145848025,3848250,0.51,'trade',now()-interval '297 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',8.281660928e-7,0.0000024844982784,4368000,8.82,'trade',now()-interval '288 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',9.109097210749999e-7,0.000002732729163225,4887750,9.95,'trade',now()-interval '279 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.0000010029461674999998,0.0000030088385024999993,5407500,12.75,'trade',now()-interval '270 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.0000011042754320749999,0.0000033128262962249994,5927250,14.22,'trade',now()-interval '261 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.0000012148975147999998,0.0000036446925443999995,6447000,13.13,'trade',now()-interval '252 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.0000013348124156749999,0.000004004437247025,6966750,12.92,'trade',now()-interval '243 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.0000014640201346999997,0.000004392060404099999,7486500,4.37,'trade',now()-interval '234 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.000001602520396460017,0.000004807561189380051,8006249,9.05,'trade',now()-interval '225 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.0000017503140271999999,0.0000052509420816,8526000,1.00,'trade',now()-interval '216 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.000001907400200675,0.0000057222006020250005,9045750,14.30,'trade',now()-interval '207 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.0000020737791923,0.0000062213375769,9565500,3.45,'trade',now()-interval '198 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.000002249451002075,0.0000067483530062249995,10085250,12.63,'trade',now()-interval '189 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.0000024344156299999997,0.000007303246889999999,10605000,8.14,'trade',now()-interval '180 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.0000026286730760749998,0.000007886019228224998,11124750,3.54,'trade',now()-interval '171 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.0000028322233402999997,0.0000084966700209,11644500,10.08,'trade',now()-interval '161 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.000003045066004224817,0.000009135198012674452,12164249,12.74,'trade',now()-interval '153 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.0000032672023231999996,0.000009801606969599998,12684000,9.55,'trade',now()-interval '144 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.0000034986310418749995,0.000010495893125624998,13203750,10.89,'trade',now()-interval '135 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.0000037393525786999993,0.000011218057736099998,13723500,9.91,'trade',now()-interval '126 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.000003989366933675,0.000011968100801025,14243250,2.99,'trade',now()-interval '116 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.0000042486741068,0.0000127460223204,14763000,12.60,'trade',now()-interval '108 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.000004517274098075,0.000013551822294225,15282750,9.04,'trade',now()-interval '99 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.000004795166363894017,0.000014385499091682052,15802499,11.85,'trade',now()-interval '90 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.000005082352535075,0.000015247057605225,16322250,6.91,'trade',now()-interval '80 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.000005378830980800001,0.000016136492942400002,16842000,11.20,'trade',now()-interval '71 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.000005684602244675,0.000017053806734025002,17361750,13.04,'trade',now()-interval '63 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.0000059996663267,0.0000179989989801,17881500,8.19,'trade',now()-interval '54 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.0000063240232268749995,0.000018972069680625,18401250,0.96,'trade',now()-interval '45 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.000006657672945200001,0.000019973018835600004,18921000,1.27,'trade',now()-interval '35 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.000007000615481675001,0.000021001846445025004,19440750,3.03,'trade',now()-interval '26 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.0000073528508363,0.000022058552508899998,19960500,1.55,'trade',now()-interval '18 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_vibe',0.000007714379009074999,0.000023143137027224994,20480250,4.59,'trade',now()-interval '9 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',5.0303408e-7,0.0000015091022399999997,420000,6.46,'trade',now()-interval '456 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',5.366384123e-7,0.0000016099152368999999,1459500,22.54,'trade',now()-interval '444 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',6.074140172e-7,0.0000018222420515999999,2499000,10.25,'trade',now()-interval '433 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',7.153607729756172e-7,0.0000021460823189268515,3538499,7.14,'trade',now()-interval '421 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',8.604790447999999e-7,0.0000025814371343999997,4578000,7.78,'trade',now()-interval '410 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.0000010427684674999998,0.0000031283054024999994,5617500,8.33,'trade',now()-interval '399 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.0000012622291627999998,0.0000037866874883999995,6657000,15.65,'trade',now()-interval '387 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.0000015188611307,0.0000045565833921,7696500,17.32,'trade',now()-interval '376 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.0000018126643711999998,0.000005437993113599999,8736000,26.14,'trade',now()-interval '364 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.0000021436388843,0.000006430916652900001,9775500,14.09,'trade',now()-interval '353 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.0000025117846699999995,0.000007535354009999998,10815000,25.88,'trade',now()-interval '342 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.0000029171017282999995,0.000008751305184899998,11854500,25.14,'trade',now()-interval '330 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.0000033595900591999998,0.000010078770177599999,12894000,26.12,'trade',now()-interval '319 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.0000038392496627,0.0000115177489881,13933500,4.24,'trade',now()-interval '307 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.0000043560805388,0.0000130682416164,14973000,10.54,'trade',now()-interval '296 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.000004910082136670017,0.000014730246410010051,16012499,7.98,'trade',now()-interval '285 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.0000055012561087999995,0.000016503768326399998,17052000,17.88,'trade',now()-interval '273 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.000006129600802700001,0.0000183888024081,18091500,22.91,'trade',now()-interval '262 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.000006795116769199999,0.000020385350307599997,19131000,13.19,'trade',now()-interval '250 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.0000074978040083,0.0000224934120249,20170500,8.92,'trade',now()-interval '239 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.00000823766252,0.00002471298756,21210000,21.76,'trade',now()-interval '228 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.0000090146923043,0.0000270440769129,22249500,17.79,'trade',now()-interval '216 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.0000098288933612,0.0000294866800836,23289000,7.67,'trade',now()-interval '205 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.000010680264853799617,0.00003204079456139885,24328499,4.19,'trade',now()-interval '193 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.0000115688092928,0.0000347064278784,25368000,19.90,'trade',now()-interval '182 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.000012494524167499999,0.0000374835725025,26407500,20.20,'trade',now()-interval '171 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.000013457410314799998,0.000040372230944399996,27447000,0.59,'trade',now()-interval '159 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.000014457467734700002,0.00004337240320410001,28486500,9.23,'trade',now()-interval '148 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.000015494696427199998,0.000046484089281599994,29526000,21.58,'trade',now()-interval '136 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.0000165690963923,0.0000497072891769,30565500,5.72,'trade',now()-interval '125 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.000017680666542788015,0.00005304199962836405,31604999,2.53,'trade',now()-interval '114 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.000018829410140299997,0.00005648823042089999,32644500,17.09,'trade',now()-interval '102 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.0000200153239232,0.0000600459717696,33684000,21.90,'trade',now()-interval '91 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.0000212384089787,0.0000637152269361,34723500,9.21,'trade',now()-interval '79 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.0000224986653068,0.0000674959959204,35763000,12.60,'trade',now()-interval '68 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.000023796092907499996,0.00007138827872249998,36802500,5.85,'trade',now()-interval '57 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.0000251306917808,0.0000753920753424,37842000,18.97,'trade',now()-interval '45 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.0000265024619267,0.0000795073857801,38881500,27.33,'trade',now()-interval '34 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.000027911403345199997,0.00008373421003559999,39921000,5.73,'trade',now()-interval '22 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_luna',0.000029357516036299995,0.00008807254810889999,40960500,27.82,'trade',now()-interval '11 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.000038699999999e-7,0.0000015000116099999998,15000,0.74,'trade',now()-interval '288 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.00054421875e-7,0.0000015001632656249999,56250,0.93,'trade',now()-interval '280 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.001635041460172e-7,0.0000015004905124380517,97499,0.81,'trade',now()-interval '272 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.003311221020172e-7,0.0000015009933663060516,138749,0.94,'trade',now()-interval '264 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.005572738080172e-7,0.0000015016718214240515,179999,0.41,'trade',now()-interval '256 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.00841966875e-7,0.000001502525900625,221250,0.71,'trade',now()-interval '248 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.011851875e-7,0.0000015035555625,262500,0.46,'trade',now()-interval '240 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.01586941875e-7,0.000001504760825625,303750,1.10,'trade',now()-interval '232 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.020472299999999e-7,0.0000015061416899999997,345000,0.80,'trade',now()-interval '224 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.02566051875e-7,0.000001507698155625,386250,0.53,'trade',now()-interval '216 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.031434075e-7,0.0000015094302224999998,427500,1.06,'trade',now()-interval '208 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.03779296875e-7,0.000001511337890625,468750,0.59,'trade',now()-interval '199 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.044737024560171e-7,0.0000015134211073680513,509999,0.07,'trade',now()-interval '192 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.05226676875e-7,0.0000015156800306250001,551250,1.18,'trade',now()-interval '184 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.060381675e-7,0.0000015181145025,592500,0.96,'trade',now()-interval '176 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.06908191875e-7,0.000001520724575625,633750,0.61,'trade',now()-interval '167 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.078367267800171e-7,0.0000015235101803400515,674999,0.00,'trade',now()-interval '160 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.088238418749999e-7,0.0000015264715256249998,716250,0.40,'trade',now()-interval '152 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.098694675e-7,0.0000015296084025,757500,0.88,'trade',now()-interval '144 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.10973626875e-7,0.0000015329208806249999,798750,0.24,'trade',now()-interval '136 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.1213632e-7,0.00000153640896,840000,0.71,'trade',now()-interval '128 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.133575468749999e-7,0.000001540072640625,881250,0.56,'trade',now()-interval '120 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.146373075e-7,0.0000015439119225,922500,0.65,'trade',now()-interval '111 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.159755687220171e-7,0.0000015479267061660514,963749,0.81,'trade',now()-interval '104 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.173723954280172e-7,0.0000015521171862840517,1004999,0.46,'trade',now()-interval '96 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.18827791875e-7,0.000001556483375625,1046250,1.17,'trade',now()-interval '88 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.203416875e-7,0.0000015610250625,1087500,1.04,'trade',now()-interval '80 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.21914116875e-7,0.000001565742350625,1128750,1.04,'trade',now()-interval '72 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.2354508e-7,0.00000157063524,1170000,0.04,'trade',now()-interval '64 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.25234576875e-7,0.000001575703730625,1211250,0.90,'trade',now()-interval '55 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.269826075e-7,0.0000015809478224999998,1252500,1.08,'trade',now()-interval '47 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.28789171875e-7,0.000001586367515625,1293750,0.69,'trade',now()-interval '39 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.306542240760172e-7,0.0000015919626722280516,1334999,0.45,'trade',now()-interval '32 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.325779018749999e-7,0.000001597733705625,1376250,0.56,'trade',now()-interval '24 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.345600675e-7,0.0000016036802025,1417500,0.16,'trade',now()-interval '16 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_crater',5.36600766875e-7,0.0000016098023006249999,1458750,0.25,'trade',now()-interval '8 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',5.0396288e-7,0.00000151188864,480000,23.65,'trade',now()-interval '360 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',5.478542528e-7,0.0000016435627584,1668000,91.31,'trade',now()-interval '351 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',6.402958592e-7,0.0000019208875776,2856000,91.73,'trade',now()-interval '342 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',7.812875600864172e-7,0.0000023438626802592516,4043999,112.58,'trade',now()-interval '333 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',9.708297727999998e-7,0.0000029124893183999995,5232000,67.30,'trade',now()-interval '324 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.00000120892208,0.00000362676624,6420000,3.61,'trade',now()-interval '315 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.0000014955646207999999,0.0000044866938624,7608000,33.49,'trade',now()-interval '306 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.0000018307573951999998,0.000005492272185599999,8796000,74.53,'trade',now()-interval '297 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.0000022145004031999997,0.0000066435012096,9984000,25.17,'trade',now()-interval '288 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.0000026467936447999998,0.0000079403809344,11172000,62.41,'trade',now()-interval '279 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.00000312763712,0.00000938291136,12360000,31.43,'trade',now()-interval '270 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.0000036570308288,0.0000109710924864,13548000,23.27,'trade',now()-interval '261 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.0000042349747712,0.0000127049243136,14736000,4.67,'trade',now()-interval '252 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.000004861468947200001,0.000014584406841600002,15924000,94.61,'trade',now()-interval '243 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.000005536513356800001,0.000016609540070400002,17112000,101.34,'trade',now()-interval '234 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.000006260108,0.000018780324,18300000,54.75,'trade',now()-interval '225 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.0000070322528768,0.000021096758630399998,19488000,64.96,'trade',now()-interval '216 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.0000078529479872,0.000023558843961599998,20676000,101.35,'trade',now()-interval '207 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.0000087221933312,0.0000261665799936,21864000,44.61,'trade',now()-interval '198 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.000009639988908799999,0.000028919966726399997,23052000,21.96,'trade',now()-interval '189 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.00001060633472,0.000031819004159999996,24240000,2.12,'trade',now()-interval '180 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.0000116212307648,0.000034863692294400004,25428000,12.81,'trade',now()-interval '171 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.0000126846770432,0.000038054031129599995,26616000,93.49,'trade',now()-interval '161 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.000013796672598742418,0.000041390017796227255,27803999,44.43,'trade',now()-interval '153 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.0000149572203008,0.0000448716609024,28992000,74.72,'trade',now()-interval '144 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.00001616631728,0.00004849895184,30180000,14.05,'trade',now()-interval '135 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.000017423964492799997,0.00005227189347839999,31368000,104.73,'trade',now()-interval '126 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.000018730161939199997,0.00005619048581759999,32556000,47.17,'trade',now()-interval '116 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.0000200849096192,0.0000602547288576,33744000,33.93,'trade',now()-interval '108 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.000021488207532799998,0.0000644646225984,34932000,93.43,'trade',now()-interval '99 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.00002294005568,0.00006882016704,36120000,95.86,'trade',now()-interval '90 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.0000244404540608,0.0000733213621824,37308000,74.33,'trade',now()-interval '80 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.0000259894026752,0.0000779682080256,38496000,85.08,'trade',now()-interval '71 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.000027586901523199998,0.0000827607045696,39684000,98.74,'trade',now()-interval '63 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.0000292329506048,0.0000876988518144,40872000,42.00,'trade',now()-interval '54 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.000030927549919999996,0.00009278264975999999,42060000,6.67,'trade',now()-interval '45 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.000032670699468799996,0.0000980120984064,43248000,11.79,'trade',now()-interval '35 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.000034462399251199995,0.00010338719775359999,44436000,65.41,'trade',now()-interval '26 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.000036302649267199993,0.00010890794780159997,45624000,104.12,'trade',now()-interval '18 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_nftape',0.0000381914495168,0.00011457434855039999,46812000,104.57,'trade',now()-interval '9 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',5.0055728e-7,0.0000015016718399999999,180000,9.21,'trade',now()-interval '264 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',5.0891648e-7,0.00000152674944,720000,3.99,'trade',now()-interval '256 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',5.273066766560172e-7,0.0000015819200299680515,1259999,6.61,'trade',now()-interval '248 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',5.557279380800171e-7,0.0000016671838142400515,1799999,13.67,'trade',now()-interval '240 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',5.941803199999999e-7,0.0000017825409599999998,2340000,14.87,'trade',now()-interval '232 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',6.4266368e-7,0.0000019279910399999997,2880000,4.30,'trade',now()-interval '224 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',7.0117808e-7,0.00000210353424,3420000,8.03,'trade',now()-interval '216 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',7.6972352e-7,0.0000023091705599999998,3960000,10.60,'trade',now()-interval '208 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',8.483e-7,0.0000025449,4500000,12.09,'trade',now()-interval '200 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',9.369073466240171e-7,0.000002810722039872051,5039999,7.97,'trade',now()-interval '192 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',0.00000103554608,0.00000310663824,5580000,11.05,'trade',now()-interval '184 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',0.0000011442154694720172,0.0000034326464084160517,6119999,13.77,'trade',now()-interval '176 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',0.00000126291632,0.0000037887489599999996,6660000,2.66,'trade',now()-interval '168 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',0.000001391647752320017,0.000004174943256960051,7199999,1.41,'trade',now()-interval '160 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',0.0000015304107199999997,0.000004591232159999999,7740000,11.03,'trade',now()-interval '151 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',0.000001679204195168017,0.000005037612585504051,8279999,14.36,'trade',now()-interval '144 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',0.00000183802928,0.00000551408784,8820000,10.76,'trade',now()-interval '136 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',0.00000200688512,0.0000060206553600000005,9360000,13.83,'trade',now()-interval '128 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',0.000002185771659440017,0.000006557314978320051,9899999,4.20,'trade',now()-interval '120 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',0.0000023746899199999998,0.000007124069759999999,10440000,11.10,'trade',now()-interval '111 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',0.00000257363888,0.000007720916639999999,10980000,9.76,'trade',now()-interval '104 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',0.0000027826188799999997,0.000008347856639999999,11520000,13.55,'trade',now()-interval '96 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',0.000003001629505136017,0.00000900488851540805,12059999,11.34,'trade',now()-interval '88 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',0.0000032306719999999995,0.000009692015999999998,12600000,10.99,'trade',now()-interval '80 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',0.0000034697451199999998,0.00001040923536,13140000,5.92,'trade',now()-interval '72 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',0.0000037188492799999995,0.000011156547839999998,13680000,11.77,'trade',now()-interval '64 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',0.000003977983990832017,0.00001193395197249605,14219999,0.92,'trade',now()-interval '56 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',0.00000424715072,0.000012741452159999999,14760000,2.59,'trade',now()-interval '47 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',0.000004526348000000001,0.000013579044000000002,15300000,13.77,'trade',now()-interval '40 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',0.00000481557632,0.000014446728959999998,15840000,5.25,'trade',now()-interval '32 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',0.000005114835116528017,0.000015344505349584052,16379999,7.85,'trade',now()-interval '24 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',0.00000542412608,0.00001627237824,16920000,10.77,'trade',now()-interval '15 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_canvas',0.00000574344752,0.000017230342560000002,17460000,6.22,'trade',now()-interval '7 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',5.0465088e-7,0.00000151395264,520000,117.40,'trade',now()-interval '672 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',5.561622828e-7,0.0000016684868484,1807000,74.45,'trade',now()-interval '655 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',6.646527792e-7,0.0000019939583376,3094000,126.83,'trade',now()-interval '638 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',8.301223692e-7,0.0000024903671076,4381000,137.41,'trade',now()-interval '621 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.0000010525710528,0.0000031577131584000002,5668000,181.77,'trade',now()-interval '604 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.00000133199883,0.000003995996489999999,6955000,125.53,'trade',now()-interval '588 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.0000016684057008,0.000005005217102400001,8242000,5.79,'trade',now()-interval '571 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.0000020617916652,0.000006185374995600001,9529000,133.44,'trade',now()-interval '554 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.0000025121567232,0.0000075364701695999995,10816000,157.35,'trade',now()-interval '537 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.0000030195008748,0.0000090585026244,12103000,149.46,'trade',now()-interval '520 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.00000358382412,0.000010751472360000001,13390000,79.87,'trade',now()-interval '504 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.0000042051264588,0.000012615379376400002,14677000,56.40,'trade',now()-interval '487 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.0000048834078912,0.0000146502236736,15964000,130.21,'trade',now()-interval '470 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.0000056186684172,0.0000168560052516,17251000,21.05,'trade',now()-interval '453 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.0000064109080368,0.0000192327241104,18538000,28.61,'trade',now()-interval '436 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.00000726012675,0.00002178038025,19825000,190.18,'trade',now()-interval '420 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.0000081663245568,0.0000244989736704,21112000,17.77,'trade',now()-interval '403 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.0000091295014572,0.0000273885043716,22399000,177.54,'trade',now()-interval '386 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.0000101496574512,0.0000304489723536,23686000,58.33,'trade',now()-interval '369 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.0000112267925388,0.0000336803776164,24973000,35.67,'trade',now()-interval '352 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.00001236090672,0.00003708272016,26260000,52.17,'trade',now()-interval '336 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.000013551999994799999,0.000040655999984399996,27547000,22.22,'trade',now()-interval '319 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.000014800072363199999,0.000044400217089599994,28834000,191.77,'trade',now()-interval '302 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.000016105122789037614,0.00004831536836711284,30120999,135.45,'trade',now()-interval '285 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.0000174671543808,0.0000524014631424,31408000,130.28,'trade',now()-interval '268 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.00001888616403,0.00005665849209,32695000,80.51,'trade',now()-interval '252 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.000020362152772799998,0.00006108645831839999,33982000,187.53,'trade',now()-interval '235 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.0000218951206092,0.00006568536182759999,35269000,87.44,'trade',now()-interval '218 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.000023485067539199998,0.0000704552026176,36556000,124.71,'trade',now()-interval '201 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.000025131993562799997,0.00007539598068839999,37843000,13.09,'trade',now()-interval '184 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.000026835898679999998,0.00008050769603999999,39130000,178.79,'trade',now()-interval '168 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.000028596782890799995,0.00008579034867239998,40417000,152.20,'trade',now()-interval '151 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.0000304146461952,0.0000912439385856,41704000,197.49,'trade',now()-interval '134 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.0000322894885932,0.0000968684657796,42991000,166.64,'trade',now()-interval '117 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.000034221310084799997,0.00010266393025439999,44278000,89.45,'trade',now()-interval '100 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.00003621011067,0.00010863033201,45565000,27.66,'trade',now()-interval '84 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.000038255890348799996,0.00011476767104639999,46852000,61.33,'trade',now()-interval '67 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.0000403586491212,0.00012107594736359999,48139000,172.83,'trade',now()-interval '50 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.0000425183869872,0.00012755516096159999,49426000,179.72,'trade',now()-interval '33 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_yolo',0.0000447351039468,0.0001342053118404,50713000,118.71,'trade',now()-interval '16 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',5.011627199999999e-7,0.00000150348816,260000,8.28,'trade',now()-interval '312 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',5.1455808e-7,0.0000015436742399999999,920000,8.84,'trade',now()-interval '304 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',5.4293808e-7,0.00000162881424,1580000,10.27,'trade',now()-interval '296 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',5.8630272e-7,0.0000017589081600000002,2240000,5.85,'trade',now()-interval '288 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',6.44652e-7,0.000001933956,2900000,6.78,'trade',now()-interval '280 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',7.1798592e-7,0.00000215395776,3560000,0.77,'trade',now()-interval '272 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',8.0630448e-7,0.00000241891344,4220000,3.15,'trade',now()-interval '264 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',9.0960768e-7,0.0000027288230399999998,4880000,4.43,'trade',now()-interval '256 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.00000102789552,0.00000308368656,5540000,2.93,'trade',now()-interval '248 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.000001161168,0.000003483504,6200000,6.52,'trade',now()-interval '240 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.00000130942512,0.00000392827536,6860000,5.59,'trade',now()-interval '232 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.00000147266688,0.00000441800064,7520000,0.68,'trade',now()-interval '224 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.00000165089328,0.00000495267984,8180000,7.53,'trade',now()-interval '216 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.0000018441043199999998,0.000005532312959999999,8840000,1.21,'trade',now()-interval '208 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.0000020523,0.0000061568999999999994,9500000,3.95,'trade',now()-interval '199 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.00000227548032,0.000006826440959999999,10160000,1.02,'trade',now()-interval '192 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.00000251364528,0.00000754093584,10820000,0.16,'trade',now()-interval '184 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.0000027667948799999996,0.000008300384639999998,11480000,6.57,'trade',now()-interval '176 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.0000030349291199999997,0.00000910478736,12140000,1.70,'trade',now()-interval '168 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.000003318048,0.000009954144,12800000,4.89,'trade',now()-interval '160 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.0000036161515199999997,0.000010848454559999999,13460000,3.96,'trade',now()-interval '152 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.000003929239194272017,0.000011787717582816051,14119999,1.14,'trade',now()-interval '144 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.000004257312479999999,0.000012771937439999999,14780000,1.69,'trade',now()-interval '136 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.00000460036992,0.00001380110976,15440000,1.71,'trade',now()-interval '128 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.000004958412,0.000014875236000000001,16100000,9.37,'trade',now()-interval '120 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.00000533143872,0.00001599431616,16760000,8.26,'trade',now()-interval '111 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.00000571945008,0.00001715835024,17420000,0.75,'trade',now()-interval '104 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.0000061224460799999995,0.00001836733824,18080000,0.88,'trade',now()-interval '96 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.0000065404267200000005,0.00001962128016,18740000,0.05,'trade',now()-interval '88 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.000006973392000000001,0.000020920176,19400000,4.42,'trade',now()-interval '80 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.00000742134192,0.00002226402576,20060000,7.15,'trade',now()-interval '71 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.000007884275767232017,0.00002365282730169605,20719999,10.36,'trade',now()-interval '64 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.000008362195679999999,0.000025086587039999995,21380000,0.24,'trade',now()-interval '56 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.00000885509952,0.00002656529856,22040000,4.06,'trade',now()-interval '48 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.000009362988,0.000028088964000000003,22700000,1.14,'trade',now()-interval '40 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.000009885861120000001,0.000029657583360000003,23360000,2.62,'trade',now()-interval '31 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.00001042371888,0.00003127115664,24020000,9.91,'trade',now()-interval '23 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.00001097656128,0.000032929683839999996,24680000,8.90,'trade',now()-interval '16 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_zen',0.000011544388319999999,0.00003463316496,25340000,7.20,'trade',now()-interval '8 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_chaos',5.02752e-7,0.000001508256,400000,2.23,'trade',now()-interval '192 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_chaos',5.722829294800172e-7,0.0000017168487884400516,2049999,1.01,'trade',now()-interval '184 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_chaos',7.354678727200172e-7,0.0000022064036181600515,3699999,5.30,'trade',now()-interval '176 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_chaos',9.92307e-7,0.000002976921,5350000,5.33,'trade',now()-interval '168 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_chaos',0.0000013428,0.0000040284,7000000,23.48,'trade',now()-interval '160 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_chaos',0.000001786947,0.000005360841,8650000,21.91,'trade',now()-interval '152 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_chaos',0.000002324748,0.0000069742440000000004,10300000,25.86,'trade',now()-interval '144 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_chaos',0.000002956203,0.000008868609,11950000,11.60,'trade',now()-interval '136 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_chaos',0.0000036813115321600165,0.00001104393459648005,13599999,6.74,'trade',now()-interval '128 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_chaos',0.000004500075,0.000013500225000000002,15250000,19.51,'trade',now()-interval '120 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_chaos',0.000005412492,0.000016237476,16900000,20.81,'trade',now()-interval '111 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_chaos',0.000006418563,0.000019255689000000003,18550000,22.25,'trade',now()-interval '104 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_chaos',0.000007518288,0.000022554864,20200000,17.75,'trade',now()-interval '96 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_chaos',0.000008711667,0.000026135001,21850000,22.04,'trade',now()-interval '88 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_chaos',0.0000099987,0.0000299961,23500000,6.12,'trade',now()-interval '80 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_chaos',0.000011379387,0.000034138161,25150000,12.90,'trade',now()-interval '72 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_chaos',0.000012853727078080018,0.00003856118123424006,26799999,9.11,'trade',now()-interval '64 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_chaos',0.000014421723,0.000043265169,28450000,15.60,'trade',now()-interval '55 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_chaos',0.000016083370964560016,0.00004825011289368005,30099999,4.48,'trade',now()-interval '48 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_chaos',0.000017838674999999997,0.00005351602499999999,31750000,13.68,'trade',now()-interval '40 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_chaos',0.000019687632,0.000059062895999999996,33400000,20.55,'trade',now()-interval '31 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_chaos',0.000021630243,0.000064890729,35050000,19.70,'trade',now()-interval '24 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_chaos',0.000023666507999999996,0.000070999524,36700000,25.25,'trade',now()-interval '16 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_chaos',0.000025796426999999996,0.00007738928099999999,38350000,6.90,'trade',now()-interval '7 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',5.0062092e-7,0.00000150186276,190000,6.05,'trade',now()-interval '600 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',5.07497997075e-7,0.0000015224939912249998,660250,8.77,'trade',now()-interval '585 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',5.219821203e-7,0.0000015659463609,1130500,13.80,'trade',now()-interval '570 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',5.440732346092171e-7,0.0000016322197038276514,1600749,8.17,'trade',now()-interval '555 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',5.737715051999999e-7,0.0000017213145155999998,2071000,16.35,'trade',now()-interval '540 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',6.11076766875e-7,0.000001833230300625,2541250,15.20,'trade',now()-interval '525 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',6.559890747e-7,0.0000019679672241,3011500,14.59,'trade',now()-interval '510 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',7.08508428675e-7,0.000002125525286025,3481750,3.86,'trade',now()-interval '495 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',7.686348288e-7,0.0000023059044864,3952000,5.13,'trade',now()-interval '480 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',8.36368275075e-7,0.0000025091048252249998,4422250,15.92,'trade',now()-interval '465 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',9.117087675e-7,0.0000027351263025,4892500,8.58,'trade',now()-interval '450 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',9.94656306075e-7,0.0000029839689182249997,5362750,7.79,'trade',now()-interval '435 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',0.0000010852108907999999,0.0000032556326723999996,5833000,12.77,'trade',now()-interval '420 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',0.0000011833725216749998,0.0000035501175650249995,6303250,17.98,'trade',now()-interval '405 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',0.0000012891411987,0.0000038674235961,6773500,8.45,'trade',now()-interval '390 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',0.000001402516921875,0.000004207550765625,7243750,0.41,'trade',now()-interval '375 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',0.0000015234996911999999,0.000004570499073599999,7714000,7.23,'trade',now()-interval '360 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',0.0000016520895066749998,0.000004956268520025,8184250,3.33,'trade',now()-interval '344 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',0.0000017882863683,0.0000053648591049,8654500,15.75,'trade',now()-interval '330 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',0.000001932090276075,0.000005796270828225,9124750,6.28,'trade',now()-interval '315 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',0.00000208350123,0.00000625050369,9595000,5.61,'trade',now()-interval '300 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',0.000002242519230075,0.000006727557690224999,10065250,5.37,'trade',now()-interval '285 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',0.0000024091442762999996,0.0000072274328288999985,10535500,1.06,'trade',now()-interval '269 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',0.000002583375990077217,0.000007750127970231651,11005749,17.51,'trade',now()-interval '255 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',0.0000027652155071999996,0.000008295646521599999,11476000,12.89,'trade',now()-interval '240 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',0.0000029546616918749998,0.000008863985075625,11946250,11.37,'trade',now()-interval '225 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',0.0000031517149227,0.000009455144768099999,12416500,14.47,'trade',now()-interval '210 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',0.000003356375199675,0.000010069125599025,12886750,15.09,'trade',now()-interval '194 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',0.0000035686425227999992,0.000010705927568399998,13357000,15.64,'trade',now()-interval '180 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',0.000003788516892075,0.000011365550676225001,13827250,12.19,'trade',now()-interval '165 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',0.000004015997815666017,0.000012047993446998051,14297499,2.83,'trade',now()-interval '150 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',0.000004251086769075,0.000012753260307225,14767750,14.70,'trade',now()-interval '134 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',0.0000044937822768,0.0000134813468304,15238000,7.93,'trade',now()-interval '119 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',0.000004744084830675,0.000014232254492025,15708250,10.97,'trade',now()-interval '105 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',0.0000050019944307,0.0000150059832921,16178500,18.43,'trade',now()-interval '90 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',0.000005267511076875,0.000015802533230625,16648750,6.73,'trade',now()-interval '75 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',0.0000055406347692,0.0000166219043076,17119000,9.47,'trade',now()-interval '59 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',0.000005821365507675,0.000017464096523025,17589250,1.05,'trade',now()-interval '44 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',0.0000061097032923,0.0000183291098769,18059500,16.40,'trade',now()-interval '30 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_mate',0.000006405648123075,0.000019216944369224998,18529750,11.13,'trade',now()-interval '15 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',5.0558828e-7,0.00000151676484,570000,74.84,'trade',now()-interval '480 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',5.674819736749999e-7,0.0000017024459210249998,1980750,2.07,'trade',now()-interval '468 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',6.978390827e-7,0.0000020935172481,3391500,148.99,'trade',now()-interval '456 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',8.966594418776172e-7,0.0000026899783256328515,4802249,33.47,'trade',now()-interval '444 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.0000011639435468,0.0000034918306404,6213000,128.18,'trade',now()-interval '432 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.000001499690901875,0.0000044990727056250004,7623750,75.06,'trade',now()-interval '420 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.0000019039016722999998,0.0000057117050169,9034500,144.90,'trade',now()-interval '408 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.000002376575858075,0.000007129727574225,10445250,89.50,'trade',now()-interval '396 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.0000029177134591999996,0.000008753140377599999,11856000,93.80,'trade',now()-interval '384 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.0000035273144756749995,0.000010581943427024998,13266750,154.89,'trade',now()-interval '372 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.0000042053789074999996,0.0000126161367225,14677500,152.25,'trade',now()-interval '360 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.000004951906754675,0.000014855720264025,16088250,29.81,'trade',now()-interval '348 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.0000057668980172,0.0000173006940516,17499000,82.70,'trade',now()-interval '336 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.0000066503526950750005,0.000019951058085225,18909750,135.28,'trade',now()-interval '324 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.0000076022707883,0.0000228068123649,20320500,139.78,'trade',now()-interval '312 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.000008622652296874999,0.000025867956890624996,21731250,37.50,'trade',now()-interval '300 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.000009711497220799999,0.000029134491662399998,23142000,88.42,'trade',now()-interval '288 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.000010868805560075,0.000032606416680225,24552750,104.42,'trade',now()-interval '276 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.0000120945773147,0.0000362837319441,25963500,80.29,'trade',now()-interval '264 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.000013388812484675,0.000040166437454025,27374250,118.23,'trade',now()-interval '252 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.000014751511070000002,0.000044254533210000005,28785000,121.84,'trade',now()-interval '240 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.000016182673070675,0.00004854801921202499,30195750,77.35,'trade',now()-interval '228 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.000017682298486699998,0.0000530468954601,31606500,144.78,'trade',now()-interval '216 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.000019250386182281615,0.000057751158546844846,33017249,136.40,'trade',now()-interval '204 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.0000208869395648,0.00006266081869439999,34428000,90.03,'trade',now()-interval '192 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.000022591955226874997,0.00006777586568062498,35838750,81.26,'trade',now()-interval '180 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.000024365434304299997,0.00007309630291289998,37249500,132.35,'trade',now()-interval '168 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.000026207376797075,0.00007862213039122499,38660250,112.61,'trade',now()-interval '155 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.000028117782705199995,0.00008435334811559998,40071000,11.89,'trade',now()-interval '144 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.000030096652028674997,0.000090289956086025,41481750,142.11,'trade',now()-interval '132 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.000032143984767499995,0.00009643195430249999,42892500,4.48,'trade',now()-interval '120 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.000034259780921675,0.000102779342765025,44303250,157.08,'trade',now()-interval '108 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.0000364440404912,0.0001093321214736,45714000,128.36,'trade',now()-interval '95 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.000038696763476074994,0.00011609029042822499,47124750,173.76,'trade',now()-interval '84 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.000041017949876299995,0.00012305384962889998,48535500,95.73,'trade',now()-interval '72 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.000043407599691874995,0.000130222799075625,49946250,103.62,'trade',now()-interval '60 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.0000458657129228,0.0001375971387684,51357000,18.55,'trade',now()-interval '47 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.000048392289569075,0.00014517686870722498,52767750,118.21,'trade',now()-interval '35 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.00005098732963069999,0.00015296198889209998,54178500,68.88,'trade',now()-interval '24 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_fomo',0.000053650833107675,0.000160952499323025,55589250,54.71,'trade',now()-interval '12 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',5.0578608e-7,0.00000151735824,580000,116.28,'trade',now()-interval '672 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',5.698705323e-7,0.0000017096115968999999,2015500,62.31,'trade',now()-interval '655 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',7.048416972e-7,0.0000021145250916,3451000,13.44,'trade',now()-interval '638 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',9.106994066044172e-7,0.0000027320982198132516,4886499,106.37,'trade',now()-interval '621 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.0000011874441648,0.0000035623324943999996,6322000,65.63,'trade',now()-interval '604 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.0000015350754675000001,0.0000046052264025,7757500,27.15,'trade',now()-interval '588 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.0000019535934828,0.0000058607804483999995,9193000,84.06,'trade',now()-interval '571 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.0000024429982106999997,0.0000073289946320999995,10628500,49.59,'trade',now()-interval '554 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.0000030032896511999997,0.0000090098689536,12064000,69.61,'trade',now()-interval '537 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.0000036344678042999998,0.0000109034034129,13499500,83.90,'trade',now()-interval '520 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.00000433653267,0.00001300959801,14935000,11.53,'trade',now()-interval '504 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.0000051094842483,0.0000153284527449,16370500,107.72,'trade',now()-interval '487 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.0000059533225392,0.000017859967617599997,17806000,90.25,'trade',now()-interval '470 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.0000068680475427,0.0000206041426281,19241500,18.97,'trade',now()-interval '453 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.0000078536592588,0.000023560977776400002,20677000,118.91,'trade',now()-interval '436 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.0000089101576875,0.000026730473062499997,22112500,34.26,'trade',now()-interval '420 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.0000100375428288,0.0000301126284864,23548000,70.00,'trade',now()-interval '403 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.0000112358146827,0.0000337074440481,24983500,99.41,'trade',now()-interval '386 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.000012504973249200001,0.0000375149197476,26419000,94.28,'trade',now()-interval '369 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.000013845018528299999,0.00004153505558489999,27854500,80.90,'trade',now()-interval '352 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.00001525595052,0.00004576785156,29290000,60.70,'trade',now()-interval '336 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.0000167377692243,0.0000502133076729,30725500,79.21,'trade',now()-interval '319 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.0000182904746412,0.0000548714239236,32161000,9.53,'trade',now()-interval '302 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.000019914065614980415,0.000059742196844941245,33596499,76.37,'trade',now()-interval '285 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.0000216085456128,0.0000648256368384,35032000,93.56,'trade',now()-interval '268 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.000023373911167499996,0.00007012173350249999,36467500,1.11,'trade',now()-interval '252 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.000025210163434799996,0.00007563049030439999,37903000,88.27,'trade',now()-interval '235 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.000027117302414699997,0.00008135190724409998,39338500,37.35,'trade',now()-interval '218 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.000029095328107199998,0.00008728598432159999,40774000,111.64,'trade',now()-interval '201 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.000031144240512299996,0.00009343272153689998,42209500,23.57,'trade',now()-interval '184 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.00003326403963,0.00009979211889,43645000,87.15,'trade',now()-interval '168 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.0000354547254603,0.0001063641763809,45080500,128.62,'trade',now()-interval '151 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.000037716298003199993,0.00011314889400959997,46516000,50.82,'trade',now()-interval '134 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.000040048757258699994,0.00012014627177609998,47951500,81.16,'trade',now()-interval '117 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.0000424521032268,0.0001273563096804,49387000,73.54,'trade',now()-interval '100 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.00004492633590749999,0.00013477900772249999,50822500,110.65,'trade',now()-interval '84 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.0000474714553008,0.0001424143659024,52258000,117.31,'trade',now()-interval '67 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.000050087461406699994,0.00015026238422009998,53693500,109.72,'trade',now()-interval '50 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.000052774354225199994,0.0001583230626756,55129000,37.84,'trade',now()-interval '33 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_hodl',0.0000555321337563,0.0001665964012689,56564500,51.14,'trade',now()-interval '16 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',5.0008428e-7,0.00000150025284,70000,3.19,'trade',now()-interval '240 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',5.015583372e-7,0.0000015046750115999999,301000,1.43,'trade',now()-interval '232 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',5.048680128e-7,0.0000015146040384,532000,0.72,'trade',now()-interval '224 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',5.100133067999999e-7,0.0000015300399203999998,763000,3.04,'trade',now()-interval '216 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',5.169942192e-7,0.0000015509826576000002,994000,0.94,'trade',now()-interval '208 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',5.258107499999999e-7,0.0000015774322499999998,1225000,1.23,'trade',now()-interval '200 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',5.364628992e-7,0.0000016093886976,1456000,0.45,'trade',now()-interval '192 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',5.489506668e-7,0.0000016468520004,1687000,2.77,'trade',now()-interval '184 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',5.632740527999999e-7,0.0000016898221583999999,1918000,2.53,'trade',now()-interval '176 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',5.794330572e-7,0.0000017382991716,2149000,3.93,'trade',now()-interval '168 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',5.9742768e-7,0.00000179228304,2380000,0.99,'trade',now()-interval '160 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',6.172579212e-7,0.0000018517737636,2611000,3.72,'trade',now()-interval '152 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',6.389237808e-7,0.0000019167713424,2842000,0.56,'trade',now()-interval '144 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',6.624252588e-7,0.0000019872757764,3073000,0.71,'trade',now()-interval '136 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',6.877623552e-7,0.0000020632870656,3304000,3.75,'trade',now()-interval '128 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',7.1493507e-7,0.00000214480521,3535000,3.78,'trade',now()-interval '120 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',7.439434031999999e-7,0.0000022318302095999998,3766000,3.74,'trade',now()-interval '112 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',7.747872173032171e-7,0.0000023243616519096516,3996999,0.69,'trade',now()-interval '104 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',8.074669247999999e-7,0.0000024224007744,4228000,0.73,'trade',now()-interval '96 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',8.419821131999999e-7,0.0000025259463395999995,4459000,1.47,'trade',now()-interval '88 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',8.783327586640171e-7,0.0000026349982759920513,4689999,1.40,'trade',now()-interval '80 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',9.165193452e-7,0.0000027495580356,4921000,2.04,'trade',now()-interval '72 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',9.565413888e-7,0.0000028696241664,5152000,3.64,'trade',now()-interval '64 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',9.983990508e-7,0.0000029951971524,5383000,2.43,'trade',now()-interval '55 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',0.0000010420923312000001,0.0000031262769936000004,5614000,4.46,'trade',now()-interval '47 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',0.0000010876212300000001,0.0000032628636900000003,5845000,1.99,'trade',now()-interval '39 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',0.0000011349857472,0.0000034049572416,6076000,4.23,'trade',now()-interval '31 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',0.0000011841858828,0.0000035525576484,6307000,1.46,'trade',now()-interval '23 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',0.0000012352216368,0.0000037056649104,6538000,0.61,'trade',now()-interval '15 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_devtool',0.0000012880930091999999,0.0000038642790276,6769000,1.89,'trade',now()-interval '7 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.000068799999999e-7,0.00000150002064,20000,1.49,'trade',now()-interval '576 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.000830803e-7,0.0000015002492409,69500,0.38,'trade',now()-interval '561 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.002435692e-7,0.0000015007307076,119000,1.28,'trade',now()-interval '547 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.004883409036171e-7,0.0000015014650227108515,168499,0.44,'trade',now()-interval '532 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.008174128e-7,0.0000015024522383999999,218000,0.60,'trade',now()-interval '518 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.012307675e-7,0.0000015036923025,267500,1.26,'trade',now()-interval '504 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.017284108e-7,0.0000015051852324,317000,0.25,'trade',now()-interval '489 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.023103427e-7,0.0000015069310280999999,366500,0.64,'trade',now()-interval '475 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.029765631999999e-7,0.0000015089296895999997,416000,1.44,'trade',now()-interval '460 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.037270723e-7,0.0000015111812169000001,465500,0.70,'trade',now()-interval '446 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.0456187e-7,0.00000151368561,515000,1.52,'trade',now()-interval '432 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.054809562999999e-7,0.0000015164428688999997,564500,0.45,'trade',now()-interval '417 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.064843312e-7,0.0000015194529936,614000,0.39,'trade',now()-interval '403 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.075719947e-7,0.0000015227159840999999,663500,1.09,'trade',now()-interval '388 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.087439468e-7,0.0000015262318404,713000,1.38,'trade',now()-interval '374 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.100001875e-7,0.0000015300005625,762500,0.03,'trade',now()-interval '360 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.113407167999999e-7,0.0000015340221503999998,812000,0.04,'trade',now()-interval '345 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.127655347e-7,0.0000015382966041,861500,1.73,'trade',now()-interval '331 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.142746412e-7,0.0000015428239236,911000,1.64,'trade',now()-interval '316 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.158680363e-7,0.0000015476041089,960500,0.94,'trade',now()-interval '302 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.1754572e-7,0.0000015526371599999999,1010000,1.01,'trade',now()-interval '288 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.193076923e-7,0.0000015579230769,1059500,1.24,'trade',now()-interval '273 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.211539532e-7,0.0000015634618595999998,1109000,1.00,'trade',now()-interval '259 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.230844628476172e-7,0.0000015692533885428514,1158499,0.45,'trade',now()-interval '244 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.250993408e-7,0.0000015752980223999999,1208000,0.56,'trade',now()-interval '230 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.271984675e-7,0.0000015815954025,1257500,1.14,'trade',now()-interval '216 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.293818828e-7,0.0000015881456484,1307000,1.78,'trade',now()-interval '201 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.316495867e-7,0.0000015949487600999999,1356500,1.09,'trade',now()-interval '187 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.340015791999999e-7,0.0000016020047375999998,1406000,1.67,'trade',now()-interval '172 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.364378603e-7,0.0000016093135809,1455500,1.75,'trade',now()-interval '158 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.3895843e-7,0.00000161687529,1505000,0.06,'trade',now()-interval '144 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.415632883e-7,0.0000016246898649,1554500,1.69,'trade',now()-interval '129 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.442524352e-7,0.0000016327573056,1604000,1.72,'trade',now()-interval '115 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.470258706999999e-7,0.0000016410776120999998,1653500,0.19,'trade',now()-interval '100 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.498835948e-7,0.0000016496507844,1703000,1.38,'trade',now()-interval '86 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.528256075e-7,0.0000016584768225,1752500,0.59,'trade',now()-interval '72 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.558519087999999e-7,0.0000016675557264,1802000,1.41,'trade',now()-interval '57 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.589624987e-7,0.0000016768874960999998,1851500,1.09,'trade',now()-interval '43 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.621573772e-7,0.0000016864721316000001,1901000,1.00,'trade',now()-interval '28 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_debug',5.654365442999999e-7,0.0000016963096328999998,1950500,1.11,'trade',now()-interval '14 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_globe',5.02107e-7,0.000001506321,350000,10.47,'trade',now()-interval '192 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_globe',5.553416718749999e-7,0.0000016660250156249998,1793750,0.25,'trade',now()-interval '184 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_globe',6.802800761300171e-7,0.0000020408402283900513,3237499,8.99,'trade',now()-interval '176 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_globe',8.769225468749999e-7,0.000002630767640625,4681250,10.88,'trade',now()-interval '168 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_globe',0.00000114526875,0.00000343580625,6125000,1.65,'trade',now()-interval '160 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_globe',0.0000014853187968749998,0.000004455956390624999,7568750,23.40,'trade',now()-interval '152 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_globe',0.0000018970726874999999,0.0000056912180625,9012500,35.61,'trade',now()-interval '144 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_globe',0.000002380530421875,0.000007141591265625,10456250,32.46,'trade',now()-interval '136 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_globe',0.0000029356915906400167,0.00000880707477192005,11899999,20.05,'trade',now()-interval '128 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_globe',0.0000035625574218749994,0.000010687672265624998,13343750,4.32,'trade',now()-interval '120 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_globe',0.000004261126687500001,0.000012783380062500002,14787500,21.01,'trade',now()-interval '111 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_globe',0.000005031399796875001,0.000015094199390625001,16231250,30.94,'trade',now()-interval '104 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_globe',0.00000587337675,0.00001762013025,17675000,13.71,'trade',now()-interval '96 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_globe',0.000006787057546875,0.000020361172640625,19118750,1.59,'trade',now()-interval '88 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_globe',0.0000077724421875,0.000023317326562499997,20562500,8.76,'trade',now()-interval '80 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_globe',0.000008829530671875,0.000026488592015625,22006250,28.02,'trade',now()-interval '72 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_globe',0.000009958322193320016,0.00002987496657996005,23449999,6.83,'trade',now()-interval '64 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_globe',0.000011158819171874999,0.000033476457515625,24893750,34.90,'trade',now()-interval '55 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_globe',0.000012431018281490017,0.000037293054844470054,26337499,29.04,'trade',now()-interval '48 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_globe',0.000013774923046875,0.000041324769140625,27781250,20.95,'trade',now()-interval '40 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_globe',0.00001519053075,0.00004557159225,29225000,9.65,'trade',now()-interval '31 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_globe',0.000016677842296875,0.000050033526890624996,30668750,27.79,'trade',now()-interval '24 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_globe',0.000018236857687499998,0.0000547105730625,32112500,2.69,'trade',now()-interval '16 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_globe',0.000019867576921875,0.000059602730765625004,33556250,7.30,'trade',now()-interval '7 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',5.0704512e-7,0.0000015211353599999999,640000,54.35,'trade',now()-interval '552 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',5.850742272e-7,0.0000017552226815999998,2224000,146.95,'trade',now()-interval '538 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',7.494148608e-7,0.0000022482445824000004,3808000,49.99,'trade',now()-interval '524 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.000001000066835315217,0.000003000200505945651,5391999,82.78,'trade',now()-interval '510 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.0000013370307072,0.0000040110921216,6976000,102.76,'trade',now()-interval '496 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.0000017603059199999998,0.000005280917759999999,8560000,253.02,'trade',now()-interval '483 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.0000022698926592,0.0000068096779776,10144000,211.45,'trade',now()-interval '469 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.0000028657909247999996,0.0000085973727744,11728000,229.09,'trade',now()-interval '455 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.0000035480007167999995,0.000010644002150399999,13312000,272.85,'trade',now()-interval '441 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.0000043165220352,0.0000129495661056,14896000,68.03,'trade',now()-interval '427 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.00000517135488,0.000015514064639999998,16480000,219.85,'trade',now()-interval '414 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.0000061124992512,0.0000183374977536,18064000,128.31,'trade',now()-interval '400 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.0000071399551487999995,0.0000214198654464,19648000,248.56,'trade',now()-interval '386 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.0000082537225728,0.000024761167718400002,21232000,152.97,'trade',now()-interval '372 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.0000094538015232,0.0000283614045696,22816000,119.22,'trade',now()-interval '358 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.000010740192,0.000032220576,24400000,138.93,'trade',now()-interval '345 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.0000121128940032,0.0000363386820096,25984000,7.25,'trade',now()-interval '331 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.000013571907532799999,0.0000407157225984,27568000,212.55,'trade',now()-interval '317 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.0000151172325888,0.000045351697766400005,29152000,106.85,'trade',now()-interval '303 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.000016748869171199995,0.000050246607513599986,30736000,249.25,'trade',now()-interval '289 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.00001846681728,0.00005540045184,32320000,172.30,'trade',now()-interval '276 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.000020271076915199998,0.0000608132307456,33904000,4.09,'trade',now()-interval '262 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.000022161648076799996,0.00006648494423039999,35488000,210.27,'trade',now()-interval '248 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.000024138529489523212,0.00007241558846856964,37071999,214.82,'trade',now()-interval '234 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.0000262017249792,0.00007860517493760001,38656000,103.89,'trade',now()-interval '220 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.000028351230719999997,0.00008505369216,40240000,52.73,'trade',now()-interval '207 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.0000305870479872,0.0000917611439616,41824000,275.55,'trade',now()-interval '193 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.00003290917678079999,0.00009872753034239998,43408000,51.37,'trade',now()-interval '179 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.0000353176171008,0.0001059528513024,44992000,73.13,'trade',now()-interval '165 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.0000378123689472,0.0001134371068416,46576000,234.82,'trade',now()-interval '151 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.000040393432319999994,0.00012118029695999998,48160000,276.98,'trade',now()-interval '138 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.000043060807219199996,0.0001291824216576,49744000,166.82,'trade',now()-interval '124 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.000045814493644799996,0.0001374434809344,51328000,232.92,'trade',now()-interval '110 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.000048654491596799996,0.0001459634747904,52912000,208.36,'trade',now()-interval '96 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.000051580801075199994,0.00015474240322559997,54496000,32.69,'trade',now()-interval '82 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.00005459342208,0.00016378026624,56080000,47.44,'trade',now()-interval '69 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.0000576923546112,0.0001730770638336,57664000,77.24,'trade',now()-interval '55 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.00006087759866879999,0.00018263279600639996,59248000,111.17,'trade',now()-interval '41 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.0000641491542528,0.0001924474627584,60832000,173.94,'trade',now()-interval '27 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_rocket',0.0000675070213632,0.0002025210640896,62416000,40.03,'trade',now()-interval '13 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pump',5.0165292e-7,0.0000015049587599999999,310000,20.62,'trade',now()-interval '216 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pump',5.359968912675632e-7,0.0000016079906738026895,1446666,33.19,'trade',now()-interval '208 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pump',6.147860814888907e-7,0.0000018443582444666722,2583333,34.92,'trade',now()-interval '200 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pump',7.380203520320172e-7,0.0000022140610560960517,3719999,4.35,'trade',now()-interval '192 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pump',9.056999197315632e-7,0.0000027170997591946895,4856666,27.53,'trade',now()-interval '184 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pump',0.0000011178246957208907,0.000003353474087162672,5993333,59.07,'trade',now()-interval '176 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pump',0.000001374394434728017,0.000004123183304184051,7129999,77.44,'trade',now()-interval '168 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pump',0.000001675409588195563,0.00000502622876458669,8266666,76.71,'trade',now()-interval '160 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pump',0.0000020208699499528906,0.000006062609849858672,9403333,71.24,'trade',now()-interval '152 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pump',0.000002410775157424017,0.000007232325472272051,10539999,63.09,'trade',now()-interval '144 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pump',0.000002845125896659563,0.000008535377689978688,11676666,69.55,'trade',now()-interval '136 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pump',0.0000033239218441848905,0.000009971765532554672,12813333,14.71,'trade',now()-interval '128 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pump',0.000003847162520120017,0.00001154148756036005,13949999,26.41,'trade',now()-interval '120 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pump',0.000004414848845123563,0.000013244546535370689,15086666,79.87,'trade',now()-interval '112 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pump',0.00000502698037841689,0.00001508094113525067,16223333,38.80,'trade',now()-interval '104 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pump',0.00000568355712,0.00001705067136,17360000,18.22,'trade',now()-interval '96 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pump',0.000006384578433587564,0.000019153735300762692,18496666,14.40,'trade',now()-interval '88 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pump',0.00000713004555264889,0.00002139013665794667,19633333,44.02,'trade',now()-interval '80 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pump',0.000007919957165512016,0.00002375987149653605,20769999,2.74,'trade',now()-interval '72 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pump',0.000008754314662051563,0.00002626294398615469,21906666,29.63,'trade',now()-interval '64 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pump',0.00000963311736688089,0.00002889935210064267,23043333,1.85,'trade',now()-interval '56 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pump',0.00001055636528,0.00003166909584,24180000,47.32,'trade',now()-interval '48 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pump',0.000011524057530515564,0.00003457217259154669,25316666,25.25,'trade',now()-interval '40 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pump',0.00001253619582111289,0.00003760858746333867,26453333,51.08,'trade',now()-interval '32 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pump',0.000013592778370904016,0.00004077833511271205,27589999,20.43,'trade',now()-interval '24 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pump',0.000014693807038979562,0.000044081421116938684,28726666,29.73,'trade',now()-interval '16 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_pump',0.00001583928091534489,0.000047517842746034666,29863333,57.89,'trade',now()-interval '8 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_brick',5.0033712e-7,0.0000015010113599999998,140000,6.09,'trade',now()-interval '48 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_brick',6.032429999999999e-7,0.0000018097289999999998,2450000,3.82,'trade',now()-interval '40 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_brick',8.897107200000001e-7,0.00000266913216,4760000,0.45,'trade',now()-interval '32 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_brick',0.0000013597402799999999,0.00000407922084,7070000,10.73,'trade',now()-interval '24 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_brick',0.0000020133313573280173,0.0000060399940719840515,9379999,0.33,'trade',now()-interval '16 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_brick',0.00000285048492,0.00000855145476,11690000,6.50,'trade',now()-interval '7 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',5.031802799999999e-7,0.0000015095408399999998,430000,30.18,'trade',now()-interval '408 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',5.38403868675e-7,0.000001615211606025,1494250,42.26,'trade',now()-interval '397 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',6.125898626999999e-7,0.0000018377695880999997,2558500,1.89,'trade',now()-interval '387 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',7.257381374524172e-7,0.0000021772144123572517,3622749,27.77,'trade',now()-interval '377 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',8.778490668e-7,0.0000026335472004,4687000,64.49,'trade',now()-interval '367 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.0000010689222768749998,0.0000032067668306249995,5751250,72.06,'trade',now()-interval '357 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.0000012989578923,0.000003896873676899999,6815500,11.85,'trade',now()-interval '346 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.0000015679559130749998,0.000004703867739225,7879750,49.85,'trade',now()-interval '336 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.0000018759163392,0.0000056277490176,8944000,1.21,'trade',now()-interval '326 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.000002222839170675,0.000006668517512025,10008250,86.77,'trade',now()-interval '316 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.0000026087244075,0.0000078261732225,11072500,14.62,'trade',now()-interval '306 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.000003033572049675,0.000009100716149025,12136750,45.77,'trade',now()-interval '295 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.0000034973820971999997,0.0000104921462916,13201000,101.39,'trade',now()-interval '285 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.000004000154550075,0.000012000463650224998,14265250,101.65,'trade',now()-interval '275 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.0000045418894083,0.0000136256682249,15329500,84.16,'trade',now()-interval '265 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.000005122586107930017,0.00001536775832379005,16393749,58.18,'trade',now()-interval '255 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.0000057422463408,0.000017226739022400002,17458000,29.38,'trade',now()-interval '244 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.000006400868415075,0.000019202605245225,18522250,14.99,'trade',now()-interval '234 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.0000070984528947,0.0000212953586841,19586500,2.59,'trade',now()-interval '224 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.000007834999779675,0.000023504999339024998,20650750,44.62,'trade',now()-interval '214 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.00000861050907,0.00002583152721,21715000,85.15,'trade',now()-interval '204 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.000009424980765675,0.000028274942297025,22779250,47.40,'trade',now()-interval '193 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.0000102784148667,0.0000308352446001,23843500,77.67,'trade',now()-interval '183 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.000011170810516248416,0.00003351243154874525,24907749,71.85,'trade',now()-interval '173 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.000012102170284799999,0.000036306510854399995,25972000,69.09,'trade',now()-interval '163 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.000013072491601875,0.000039217474805625,27036250,69.75,'trade',now()-interval '153 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.0000140817753243,0.0000422453259729,28100500,20.48,'trade',now()-interval '142 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.000015130021452074999,0.000045390064356225,29164750,61.45,'trade',now()-interval '132 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.0000162172299852,0.000048651689955599996,30229000,80.51,'trade',now()-interval '122 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.000017343400923674996,0.00005203020277102499,31293250,100.81,'trade',now()-interval '112 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.000018508533154402015,0.000055525599463206045,32357499,19.72,'trade',now()-interval '102 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.000019712630016674996,0.00005913789005002499,33421750,4.85,'trade',now()-interval '91 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.0000209556881712,0.0000628670645136,34486000,93.75,'trade',now()-interval '81 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.000022237708731074998,0.00006671312619322499,35550250,58.01,'trade',now()-interval '71 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.0000235586916963,0.0000706760750889,36614500,82.29,'trade',now()-interval '61 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.000024918637066874996,0.00007475591120062499,37678750,48.73,'trade',now()-interval '51 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.0000263175448428,0.0000789526345284,38743000,94.87,'trade',now()-interval '40 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.000027755415024074997,0.00008326624507222499,39807250,95.04,'trade',now()-interval '30 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.000029232247610699997,0.00008769674283209999,40871500,56.10,'trade',now()-interval '20 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_banana',0.000030748042602675,0.000092244127808025,41935750,82.50,'trade',now()-interval '10 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_jungle',5.0013932e-7,0.00000150041796,90000,3.60,'trade',now()-interval '96 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_jungle',5.119205388620172e-7,0.0000015357616165860514,832499,0.16,'trade',now()-interval '88 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_jungle',5.4266675e-7,0.00000162800025,1575000,7.57,'trade',now()-interval '80 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_jungle',5.923778675e-7,0.0000017771336024999998,2317500,0.59,'trade',now()-interval '72 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_jungle',6.610538147360172e-7,0.0000019831614442080514,3059999,3.24,'trade',now()-interval '64 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_jungle',7.486949074999999e-7,0.0000022460847225,3802500,0.21,'trade',now()-interval '55 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_jungle',8.553008299999999e-7,0.00000256590249,4545000,3.90,'trade',now()-interval '48 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_jungle',9.808716874999998e-7,0.0000029426150624999995,5287500,0.80,'trade',now()-interval '40 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_jungle',0.000001125407272568017,0.000003376221817704051,6029999,8.06,'trade',now()-interval '32 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_jungle',0.0000012889079745260172,0.000003866723923578052,6772499,7.25,'trade',now()-interval '24 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_jungle',0.0000014713738699999999,0.000004414121609999999,7515000,2.74,'trade',now()-interval '15 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_jungle',0.0000016728044674999998,0.0000050184134024999995,8257500,4.25,'trade',now()-interval '8 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',5.0020812e-7,0.00000150062436,110000,15.78,'trade',now()-interval '624 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',5.02513179075e-7,0.000001507539537225,382250,3.66,'trade',now()-interval '608 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',5.073679683e-7,0.0000015221039049,654500,0.96,'trade',now()-interval '592 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',5.147724557948171e-7,0.0000015443173673844515,926749,0.70,'trade',now()-interval '577 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',5.247267372e-7,0.0000015741802116,1199000,8.56,'trade',now()-interval '561 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',5.37230716875e-7,0.000001611692150625,1471250,5.31,'trade',now()-interval '546 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',5.522844266999999e-7,0.0000016568532800999998,1743500,6.21,'trade',now()-interval '530 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',5.69887866675e-7,0.000001709663600025,2015750,8.10,'trade',now()-interval '514 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',5.900410368e-7,0.0000017701231104,2288000,8.06,'trade',now()-interval '499 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',6.12743937075e-7,0.000001838231811225,2560250,2.85,'trade',now()-interval '483 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',6.379965675e-7,0.0000019139897025,2832500,15.89,'trade',now()-interval '468 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',6.65798928075e-7,0.000001997396784225,3104750,3.35,'trade',now()-interval '452 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',6.961510187999999e-7,0.0000020884530564,3377000,7.22,'trade',now()-interval '436 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',7.29052839675e-7,0.000002187158519025,3649250,12.56,'trade',now()-interval '421 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',7.645043907e-7,0.0000022935131721,3921500,4.40,'trade',now()-interval '405 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',8.025055276100172e-7,0.0000024075165828300517,4193749,11.73,'trade',now()-interval '390 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',8.430566832e-7,0.0000025291700496,4466000,8.95,'trade',now()-interval '374 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',8.861574246749999e-7,0.000002658472274025,4738250,1.30,'trade',now()-interval '358 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',9.318078963e-7,0.0000027954236889,5010500,2.89,'trade',now()-interval '343 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',9.80008098075e-7,0.000002940024294225,5282750,8.73,'trade',now()-interval '327 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',0.00000103075803,0.00000309227409,5555000,2.08,'trade',now()-interval '312 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',0.0000010840576920749999,0.0000032521730762249996,5827250,6.69,'trade',now()-interval '296 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',0.0000011399070843,0.0000034197212528999997,6099500,14.06,'trade',now()-interval '280 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',0.0000011983059874868172,0.0000035949179624604516,6371749,9.89,'trade',now()-interval '265 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',0.0000012592550591999998,0.0000037777651775999994,6644000,12.54,'trade',now()-interval '249 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',0.000001322753641875,0.000003968260925625,6916250,12.67,'trade',now()-interval '234 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',0.0000013888019547,0.0000041664058640999996,7188500,11.57,'trade',now()-interval '218 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',0.0000014573999976749998,0.000004372199993024999,7460750,12.09,'trade',now()-interval '202 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',0.0000015285477707999999,0.0000045856433124,7733000,2.08,'trade',now()-interval '187 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',0.000001602245274075,0.000004806735822225,8005250,10.68,'trade',now()-interval '171 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',0.000001678492222754017,0.000005035476668262051,8277499,0.14,'trade',now()-interval '156 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',0.0000017572894710749998,0.000005271868413225,8549750,12.42,'trade',now()-interval '140 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',0.0000018386361648000001,0.0000055159084944,8822000,10.37,'trade',now()-interval '124 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',0.000001922532588675,0.000005767597766025,9094250,8.38,'trade',now()-interval '109 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',0.0000020089787427,0.000006026936228099999,9366500,11.37,'trade',now()-interval '93 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',0.000002097974626875,0.0000062939238806250004,9638750,3.72,'trade',now()-interval '78 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',0.0000021895202412,0.0000065685607236,9911000,7.67,'trade',now()-interval '62 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',0.000002283615585675,0.000006850846757025,10183250,13.09,'trade',now()-interval '46 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',0.0000023802606603,0.0000071407819809,10455500,7.93,'trade',now()-interval '31 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_gem',0.0000024794554650749995,0.000007438366395224999,10727750,6.18,'trade',now()-interval '15 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbit',5.0235468e-7,0.00000150706404,370000,5.79,'trade',now()-interval '48 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbit',0.00000122112075,0.0000036633622499999996,6475000,19.70,'trade',now()-interval '40 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbit',0.000003222009647248017,0.00000966602894174405,12579999,7.09,'trade',now()-interval '32 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbit',0.00000650502267,0.00001951506801,18685000,21.66,'trade',now()-interval '24 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbit',0.000011070157667224016,0.000033210473001672046,24789999,15.17,'trade',now()-interval '16 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_orbit',0.000016917417629999997,0.00005075225288999999,30895000,25.08,'trade',now()-interval '7 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_bag',5.043e-7,0.0000015129,500000,87.95,'trade',now()-interval '48 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_bag',0.0000018168749999999999,0.000005450625,8750000,8.58,'trade',now()-interval '40 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_bag',0.0000054708,0.0000164124,17000000,99.94,'trade',now()-interval '32 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_bag',0.000011466075,0.000034398225,25250000,0.27,'trade',now()-interval '24 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_bag',0.000019802698847600013,0.00005940809654280004,33499999,66.07,'trade',now()-interval '16 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_bag',0.000030480674999999996,0.00009144202499999999,41750000,86.74,'trade',now()-interval '7 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',5.0002752e-7,0.0000015000825599999999,40000,1.83,'trade',now()-interval '384 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',5.003323212e-7,0.0000015009969635999998,139000,2.40,'trade',now()-interval '374 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',5.009742768e-7,0.0000015029228304,238000,2.77,'trade',now()-interval '364 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',5.019533752072172e-7,0.0000015058601256216514,336999,1.90,'trade',now()-interval '355 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',5.032696512e-7,0.0000015098089536,436000,1.23,'trade',now()-interval '345 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',5.0492307e-7,0.0000015147692099999998,535000,2.75,'trade',now()-interval '336 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',5.069136432e-7,0.0000015207409295999998,634000,1.73,'trade',now()-interval '326 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',5.092413707999999e-7,0.0000015277241123999999,733000,2.45,'trade',now()-interval '316 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',5.119062528e-7,0.0000015357187584,832000,2.55,'trade',now()-interval '307 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',5.149082892e-7,0.0000015447248676,931000,1.94,'trade',now()-interval '297 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',5.182474799999999e-7,0.00000155474244,1030000,2.25,'trade',now()-interval '288 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',5.219238252e-7,0.0000015657714755999999,1129000,2.18,'trade',now()-interval '278 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',5.259373248e-7,0.0000015778119743999999,1228000,0.19,'trade',now()-interval '268 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',5.302879788e-7,0.0000015908639364,1327000,2.74,'trade',now()-interval '259 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',5.349757871999999e-7,0.0000016049273615999997,1426000,2.11,'trade',now()-interval '249 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',5.4000075e-7,0.00000162000225,1525000,1.71,'trade',now()-interval '240 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',5.453628672e-7,0.0000016360886016,1624000,1.83,'trade',now()-interval '230 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',5.510621387999999e-7,0.0000016531864163999998,1723000,2.36,'trade',now()-interval '220 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',5.570985648e-7,0.0000016712956944,1822000,1.56,'trade',now()-interval '211 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',5.634721452e-7,0.0000016904164356,1921000,2.37,'trade',now()-interval '201 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',5.7018288e-7,0.00000171054864,2020000,0.56,'trade',now()-interval '192 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',5.772307692e-7,0.0000017316923076,2119000,2.07,'trade',now()-interval '182 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',5.846158128e-7,0.0000017538474384,2218000,2.26,'trade',now()-interval '172 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',5.923379310952172e-7,0.0000017770137932856515,2316999,0.30,'trade',now()-interval '163 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',6.003973632e-7,0.0000018011920896,2416000,0.14,'trade',now()-interval '153 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',6.0879387e-7,0.00000182638161,2515000,2.29,'trade',now()-interval '144 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',6.175275312e-7,0.0000018525825936,2614000,1.04,'trade',now()-interval '134 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',6.265983468e-7,0.0000018797950403999999,2713000,1.43,'trade',now()-interval '124 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',6.360063167999999e-7,0.0000019080189504,2812000,2.40,'trade',now()-interval '115 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',6.457514412e-7,0.0000019372543236,2911000,2.63,'trade',now()-interval '105 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',6.5583372e-7,0.0000019675011599999998,3010000,1.69,'trade',now()-interval '96 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',6.662531532e-7,0.0000019987594596,3109000,1.60,'trade',now()-interval '86 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',6.770097408e-7,0.0000020310292224,3208000,0.08,'trade',now()-interval '76 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',6.881034827999999e-7,0.0000020643104484,3307000,2.26,'trade',now()-interval '67 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',6.995343792e-7,0.0000020986031376,3406000,1.61,'trade',now()-interval '57 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',7.1130243e-7,0.00000213390729,3505000,2.83,'trade',now()-interval '48 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',7.234076351999999e-7,0.0000021702229055999996,3604000,1.98,'trade',now()-interval '38 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',7.358499948e-7,0.0000022075499844,3703000,1.30,'trade',now()-interval '28 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',7.486295088e-7,0.0000022458885264,3802000,0.29,'trade',now()-interval '19 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_stack',7.617461772e-7,0.0000022852385316,3901000,0.56,'trade',now()-interval '9 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_whale',5.0818892e-7,0.0000015245667599999999,690000,237.57,'trade',now()-interval '192 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_whale',7.15087101875e-7,0.000002145261305625,3536250,291.58,'trade',now()-interval '184 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_whale',0.0000012006642479420171,0.000003601992743826051,6382499,333.29,'trade',now()-interval '176 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_whale',0.000001964921016875,0.000005894763050625,9228750,191.41,'trade',now()-interval '168 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_whale',0.0000030078567499999996,0.00000902357025,12075000,335.27,'trade',now()-interval '160 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_whale',0.0000043294716668750004,0.000012988415000625002,14921250,184.42,'trade',now()-interval '152 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_whale',0.0000059297657675000006,0.000017789297302500003,17767500,227.13,'trade',now()-interval '144 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_whale',0.000007808739051875,0.000023426217155625,20613750,437.57,'trade',now()-interval '136 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_whale',0.000009966390712976017,0.00002989917213892805,23459999,131.18,'trade',now()-interval '128 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_whale',0.000012402723171875,0.000037208169515625,26306250,276.21,'trade',now()-interval '120 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_whale',0.000015117734007500001,0.000045353202022500004,29152500,35.75,'trade',now()-interval '111 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_whale',0.000018111424026874997,0.00005433427208062499,31998750,397.45,'trade',now()-interval '104 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_whale',0.00002138379323,0.00006415137969,34845000,164.43,'trade',now()-interval '96 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_whale',0.000024934841616874996,0.000074804524850625,37691250,102.99,'trade',now()-interval '88 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_whale',0.000028764569187499997,0.00008629370756249999,40537500,159.82,'trade',now()-interval '80 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_whale',0.000032872975941874996,0.00009861892782562499,43383750,246.22,'trade',now()-interval '72 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_whale',0.000037260060289688016,0.00011178018086906405,46229999,325.08,'trade',now()-interval '64 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_whale',0.000041925827001875,0.000125777481005625,49076250,287.80,'trade',now()-interval '55 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_whale',0.000046870271307499995,0.00014061081392249998,51922500,258.39,'trade',now()-interval '48 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_whale',0.00005209339479687499,0.00015628018439062496,54768750,22.99,'trade',now()-interval '40 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_whale',0.000057595197469999994,0.00017278559240999997,57615000,216.95,'trade',now()-interval '31 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_whale',0.000063375679326875,0.000190127037980625,60461250,232.76,'trade',now()-interval '24 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_whale',0.00006943484036750001,0.00020830452110250002,63307500,256.41,'trade',now()-interval '16 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_whale',0.00007577268059187499,0.00022731804177562496,66153750,210.25,'trade',now()-interval '7 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_shrimp',5.004403199999999e-7,0.0000015013209599999997,160000,9.24,'trade',now()-interval '48 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_shrimp',6.34848e-7,0.000001904544,2800000,9.32,'trade',now()-interval '40 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_shrimp',0.0000010090097328640172,0.0000030270291985920517,5439999,0.16,'trade',now()-interval '32 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_shrimp',0.00000162292608,0.00000486877824,8080000,1.37,'trade',now()-interval '24 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_shrimp',0.000002476596111232017,0.0000074297883336960505,10719999,4.20,'trade',now()-interval '16 hours');
  INSERT INTO price_snapshots (token_id,price_wld,price_usdc,supply,volume,type,created_at)
  VALUES ('tok_shrimp',0.0000035700211199999992,0.000010710063359999997,13360000,5.48,'trade',now()-interval '7 hours');
  
-- DONE. 21 users, 38 tokens seeded.
