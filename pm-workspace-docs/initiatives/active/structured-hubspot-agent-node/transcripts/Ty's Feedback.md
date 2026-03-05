[0:00:00] Unknown Speaker 1: Uh-huh. Alright.

[0:00:12] Unknown Speaker 2: We're we're trying to improve the Tie. Tie. Tie. Do you like that? Improve the agent.

[0:00:18] Unknown Speaker 2: Up clock configuration. Yeah.

[0:00:19] Unknown Speaker 1: I'll move over here. Easier to see. It's maybe a little bit harder for this.

[0:00:23] Unknown Speaker 2: Cool. Cool. There there's a couple of, like, main things that we wanna solve right now. One of the hardest is associations. Remember your Yep.

[0:00:34] Unknown Speaker 2: Seven weeks with Kixie when, like, you was he finding the right place? That's one of them. The other is making sure it's only updating certain fields and that it's reading certain fields too. Like, a lot of the workflows that James is running is, like, I wanna update the deal amount, but first, I wanna read these three other fields inside of HubSpot. Mhmm.

[0:00:57] Unknown Speaker 2: So the the intention with this isn't to talk about the design as much as it is, like, the ease of configurability and how it might like, if if we're solving the right problem. Mhmm. So for example, you have a deal object from HubSpot.

[0:01:15] Unknown Speaker 1: Let's see if this one actually works. K.

[0:01:17] Unknown Speaker 2: So you got a deal object from HubSpot, and then you it'll show you all of the properties from HubSpot, like search v two. Right? K. So I want to do sales. Sorry.

[0:01:28] Unknown Speaker 2: Two one. Oh, no. You're good.

[0:01:29] Unknown Speaker 1: Is this select all?

[0:01:32] Unknown Speaker 2: Tell me more. Multi select, you mean? That's what

[0:01:34] Unknown Speaker 1: I mean.

[0:01:35] Unknown Speaker 2: Yeah. It is multi select. So I'll show you so I'll show you that now. Like, I can add multiple properties.

[0:01:40] Unknown Speaker 1: Yeah.

[0:01:40] Unknown Speaker 2: So for a single property, it just it looks like this. It collapses down is in a similar way, can say, like, I wanna grade the sales skill score based on a Bant methodology. And then we've got a couple different options here that we haven't had before. One is read before write, which the naming would be different.

[0:02:01] Unknown Speaker 1: Oh, I like that.

[0:02:02] Unknown Speaker 2: Read at the property value and take that into consideration before updating the value. Right? So I wanna read that value, maybe use it in the calculation, and maybe, like, you have the transcript there. I don't know. I need to look at what.

[0:02:17] Unknown Speaker 2: Yeah. We'll we'll It should have the transcript in context for

[0:02:21] Unknown Speaker 1: that. This node is gonna just be the HubSpot agent.

[0:02:24] Unknown Speaker 2: I don't know. I think that people still want we've

[0:02:28] Unknown Speaker 1: VAP three. Yeah.

[0:02:29] Unknown Speaker 2: Right? But Okay. Keep going.

[0:02:32] Unknown Speaker 1: Is this one? Is it gonna be same, like, structure where it's, like, create attached sand all in one? We actually

[0:02:41] Unknown Speaker 2: want to do this outside of a conversation. So it isn't real it doesn't rely on a conversation. That way, if you want to, we can have a chat, but it's not like you have to make a conversation that doesn't actually have context. You can just put the transcript here.

[0:02:57] Unknown Speaker 1: Is there a way to just, like, drop a toggle on there? It's like

[0:03:01] Unknown Speaker 2: yeah. So read before write, and then you would have property dependencies. That's pretty. So, like, on the deal, I want it to read the name, the close date, the probability stage, and then how you actually wanna write it. Do you want to add to that field?

[0:03:17] Unknown Speaker 2: Do you wanna append if it's different, or do you wanna just override it? So then you would have, like, multiple properties and be able to configure each one. So now you have one node where you know exactly which properties are being updated, what values they're reading from, and that they have context of, like, the company or the transcript.

[0:03:45] Unknown Speaker 1: Nice. Thoughts? I like that. That sounds great. I just had a thought about, um, if object type if there were notes and tasks as well, because those are a pain sometimes to generate an associate correctly.

[0:04:03] Unknown Speaker 1: K. So would it be I don't know if it'd be, like, a separate object or if, like, on deal contact company, if there's, like, a add no option with

[0:04:14] Unknown Speaker 2: Probably on a deal, it would be an add no option.

[0:04:18] Unknown Speaker 1: I see. And contacting company? Yeah. Because I mean, same.

[0:04:20] Unknown Speaker 2: Because they each have their own. Yeah. But task is a different one. I like that. Right.

[0:04:24] Unknown Speaker 2: The one of the questions I had for you too is a lot of what James does, like, he has dependencies, but, you know, maybe you want maybe amount is dependent on the deal name. So I wanna make sure that this is updated first. Yeah. So if there's whether it runs in order so I can drag which one runs first or, like, is that preferable or have a separate node? Per property?

[0:04:53] Unknown Speaker 2: Not per property, but, like so I can drag to see which one's gonna run first. And then if I have some that are dependent on these updates, I'm just gonna make another new node. So, like, these can run-in a batch, and then these ones can

[0:05:04] Unknown Speaker 1: I think order would be nice because sometimes there's, like like, a deal creation and then update these, but it'll try to update the things first since, like, there's no deal, so it stops? So if I could if I if I did deal are you gonna have the option to create versus update all of these as well?

[0:05:29] Unknown Speaker 2: Create a property or create an object? Object. I think that I don't know. Tell me. What would you like that?

[0:05:38] Unknown Speaker 1: Yeah. Because if not, then I've I'd have to do a HubSpot agent node to make that object before I create stuff with it.

[0:05:48] Unknown Speaker 2: Okay? So if oh. It's

[0:05:51] Unknown Speaker 1: yeah. So if there's, like, a create object node and it was like if this was, like, an update object and then there was a create object, then create could be, like, multi select as well, and then it'd be, like you could use AI, like, AI completion from the attendees or whatever to choose all that stuff. What

[0:06:16] Unknown Speaker 2: if so one piece that isn't here, if it's on another prototype I don't have up and running for some reason, is is that association piece that we talked about. It's, like, how you actually decide what it's connected to in HubSpot. So what if it was like, if an association is found, then

[0:06:32] Unknown Speaker 1: Oh, yeah.

[0:06:32] Unknown Speaker 2: It does it. Or if one's not, here's create a deal, and these are the properties to fill out. Yeah. Yeah? Same thing.

[0:06:39] Unknown Speaker 2: Yeah.

[0:06:39] Unknown Speaker 1: Okay. Not same thing, but same idea. Yeah. So either way.

[0:06:44] Unknown Speaker 2: Okay. That's that's actually really good feedback to know. Also, for the recording, we wanna remove the sync to HubSpot value because that's just what we're trying to do. And also update after timing. This isn't a trigger.

[0:07:00] Unknown Speaker 2: This is an action, so this doesn't make any sense unless it was, like, an agent itself.

[0:07:08] Unknown Speaker 1: In a similar sense. Wait.

[0:07:13] Unknown Speaker 2: Bear with me for a second. What if this wasn't a workflow and it was just an agent? Same way you configure signals.

[0:07:23] Unknown Speaker 1: It was like that. It is yours.

[0:07:25] Unknown Speaker 2: Okay. Cool.

[0:07:25] Unknown Speaker 1: I hate the signals.

[0:07:26] Unknown Speaker 2: We wanna remove it. We wanna remove update timing. No. It's an action.

[0:07:30] Unknown Speaker 1: What were you gonna say about signals? I just No. I've never had

[0:07:34] Unknown Speaker 2: a signal work. It's not worth it. We're gonna move on because so this is kinda what it would look like. Yeah. Right?

[0:07:42] Unknown Speaker 2: That's literally what I was imagining. We would need to remove sync to HubSpot, remove update trigger, remove the conditional trigger.

[0:07:49] Unknown Speaker 1: We also Why remove conditional? That could be nice. Because if if I wanted to check a deal stage, I'd have to do trigger HubSpot agent conditional Via update other HubSpot agents. Like, the we'll

[0:08:02] Unknown Speaker 2: call in.

[0:08:03] Unknown Speaker 1: So mean, if there's a way to put a conditional there, that'd cool. To our that's funny. Well, that's like Yeah. I don't know how technical you could get with it, but you could be, like like like that. You could be, like, run if the deal amounts over a thousand.

[0:08:17] Unknown Speaker 1: I think you should base it. That could be nice, but we can also do that already. So I would at least K. It would just be convenient to have it there.

[0:08:24] Unknown Speaker 2: Last question. If we have do you want the object type from HubSpot to be multi select? So you can say deal contact company, like, three of those, and then each of them are, like, their own toggle list for object, for a company. That

[0:08:45] Unknown Speaker 1: could get really busy. That's what I was thinking.

[0:08:48] Unknown Speaker 2: So would you prefer separate, like, one per Probably. How often are, like, deal nodes dependent on or deal properties dependent on the values of a different HubSpot object property? Not much. Cool. That's exactly what I

[0:09:03] Unknown Speaker 1: wanna do.

[0:09:04] Unknown Speaker 2: Don't know if I've ever done that. I should.

[0:09:06] Unknown Speaker 1: It's a lot of monitors.

[0:09:09] Unknown Speaker 2: K. So for the object type,

[0:09:11] Unknown Speaker 1: we wanna make

[0:09:12] Unknown Speaker 2: sure it's actually pulling the different objects, including custom objects from HubSpot.

[0:09:19] Unknown Speaker 1: It doesn't break by Friday.

[0:09:20] Unknown Speaker 2: And it's clear that, like, these are the the HubSpot objects. The properties update is multi select. Property configuration.

[0:09:29] Unknown Speaker 1: So are you thinking of making this a different note for each object? That'd be nice.

[0:09:33] Unknown Speaker 2: Is that right? Where it's still, like, an agent, and you can just decide which object type you wanna update. K. Someone, like, update properties on object on object. Yeah.

[0:09:44] Unknown Speaker 2: K.

[0:09:45] Unknown Speaker 1: HubSpot links also aren't.

[0:09:47] Unknown Speaker 2: What does that mean?

[0:09:48] Unknown Speaker 1: Like, if you ask it to create a link. A link to? To to a company, to deal, to contacts. From AskElephant? Or so

[0:10:00] Unknown Speaker 2: you have a property on a contact that's called AskElephant link, and it's unreliable for the link to be connected from that. Not

[0:10:09] Unknown Speaker 1: like there's some people that say, make a contact and add a link to the contact in HubSpot in the output. So you can tell the agent to do that, and it'll try to make a link to the contact in HubSpot, but it's not accurate.

[0:10:24] Unknown Speaker 2: So that the chat is returning the link?

[0:10:26] Unknown Speaker 1: So my output has a link to HubSpot?

[0:10:28] Unknown Speaker 2: Oh oh, does this

[0:10:36] Unknown Speaker 1: I gotta buy a lab coat.

[0:10:38] Unknown Speaker 2: How many classes are you taking? Five again.

[0:10:44] Unknown Speaker 1: 16. Sucky boy. I got my geology lab today.

[0:10:48] Unknown Speaker 2: Why is that happening? What? I'm just getting, like, triplicates. How'd Jason fix this? Mike.

[0:10:58] Unknown Speaker 1: I I like the new colors too. Me too.

[0:11:02] Unknown Speaker 2: Where is Pete?

[0:11:05] Unknown Speaker 1: He just started working. He might not be there yet.

[0:11:07] Unknown Speaker 2: He's a pretty new guy.

[0:11:11] Unknown Speaker 1: Do you get? No.

[0:11:13] Unknown Speaker 2: I would for you, though. I think I

[0:11:15] Unknown Speaker 1: actually my

[0:11:16] Unknown Speaker 2: goal is Here we go. Okay. Where this shows the properties that are updated, and it gives you a view in HubSpot. HubSpot. That's nice.

[0:11:27] Unknown Speaker 2: But it it will link you back to that actual context. So instead of having to have AskElephant generated, like, we'll we're still generating it, but it's just native to what's being updated. That's that'd cool if that was on the

[0:11:38] Unknown Speaker 1: new node. Wow.

[0:11:40] Unknown Speaker 2: Because really need to be toggled, don't they? Like, toggle list? Yeah. Like, drop down

[0:11:46] Unknown Speaker 1: Yeah. Fold up or collapse. And I would be doing that, but it needs a meeting. So, like, my workflow is not on a meeting. I can't do that,

[0:11:59] Unknown Speaker 2: which is what I was asking

[0:12:00] Unknown Speaker 1: Paul about this morning. K. Because B B 2 is nice, so I like this. I like to be able to approve or change I'm doing HubSpot. But K.

[0:12:10] Unknown Speaker 2: The other question I had was I think what this is missing is it having human in the loop.

[0:12:17] Unknown Speaker 1: Yeah. Do you want

[0:12:18] Unknown Speaker 2: it per property or per object?

[0:12:23] Unknown Speaker 1: Probably per objects, they can still see everything and then share

[0:12:26] Unknown Speaker 2: and care. What's up, guys? Dude, it's been too long since we I'm

[0:12:32] Unknown Speaker 1: interrupting super quick. Please, Zoom.

[0:12:34] Unknown Speaker 2: I just wanna say thanks. K. Did I ask the oh, yeah. Human in the loop per property or the full thing, and you just wanna be able to approve or deny?

[0:12:46] Unknown Speaker 1: Probably full thing, but approve or deny or edit. Can you do that in the in the in the one right now? Right?

[0:12:53] Unknown Speaker 2: So you just want a a toggle So I

[0:12:55] Unknown Speaker 1: wouldn't wanna toggle human in the loop for every single property

[0:12:58] Unknown Speaker 2: Yeah. Because that would just get busy. And so on the object as a whole, do you want human in the loop? K. Sweet.

[0:13:07] Unknown Speaker 1: 11. Yeah.

[0:13:07] Unknown Speaker 2: Give me

[0:13:07] Unknown Speaker 1: a timeline on like, dude, you get this, like, next week. Right? Like We

[0:13:11] Unknown Speaker 2: actually want a lot of these improvements to be in product by What if I

[0:13:15] Unknown Speaker 1: just make it for you? Please do.