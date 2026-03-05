00:00 Hey, we're talking about customer journey mapping, uh, those stage progressions and the outcomes that we're trying to drive for this project.
00:09 So I want to give a little bit of background into the problem and the intent behind what we're building. So, um, we're, we're focusing on this note of, I know where my customer is in their journey, and there's a couple dependencies that that lead into that.
00:23 And then in R we project timeline, that's, that's this project here, this stage progressions. So in order to, to know where my customer is in their journey, there's, there's a couple of things that we have to know is I have to know who my customers are.
00:37 I have to know what my journey is. I have to know what those stages are that we're trying to drive.
00:44 And those are two really simple things that I think can be talked about, um, initially as we go through this.
00:51 So a couple of examples, uh, inside of HubSpot for this. So first from the perspective of a, an account executive, we're going to use Pete because he's on our team.
01:02 It, he is one of our, our personas is Aaron. Um, but inside of HubSpot, Pete is the deal owner for these deals.
01:11 And I have it filtered by deal stages. So this is stuff inside of his pipeline. So as I scroll through, I can see information about, um, the, the names of these deals.
01:21 Um, if there's next steps, but at a glance, it's really hard to tell what actions can actually be taken where they're at outside of just this stage.
01:33 So I know that these are in limbo. I don't know anything that can come before that. I don't know how the SDR interacted with them.
01:39 I don't know if there's important things that they're waiting on, uh, at a glance. Um, it's, it's tough to know.
01:47 And then let's say that this goes over to, um, to Jazz. So this is Jazz's success pipeline. We can start to see familiar names, Redo, School AI, PestShare, Canopy, and you'll start to see some of these names repeating.
02:02 Um, and that's because they're the expansion deals inside of the, the company. So, um, if, if we actually go into some of these deals, well, we'll, we'll go to the Galactic Republic.
02:13 Um, at a glance, this is the company page and they have multiple deals. So anytime expansion happens for a company, we add five seats.
02:22 We add 12 seats. It's going to show up as. It's a new deal. So it can start to get really messy to actually understand the, the journey that they've gone through, because it just looks like extra revenue that's being added.
02:34 We can go to recent activities to scroll through. But again, you're having to read through emails, getting a true understanding of where are they at right now is, is pretty hard.
02:44 Um, so I asked inside ask elephant. I. A fort to analyze what our customer journey is inside of HubSpot. Telling us the properties that get filled out from the time that a lead is generated.
02:57 It becomes a contact attached to a company associated with a deal. And I think the insights are actually really important gear.
03:03 It tells us that what HubSpot can do really well is it gets the contact information. Can start giving us some analytics about, um.
03:11 you The insight of HubSpot, how they're interacting with our site, where they're at in the life cycle, uhm, the deals that it's associated with.
03:21 But this is what I wanted to focus on that I think that our project is driving towards. These are things that it can't track.
03:26 Property change history. Company reassignment reasons, workflow attribution for all changes. Now, this is important because on, on deals, on companies.
03:36 And he's really, You can do, for example. If a field changes, for example, if it changes from close, lost, close, one, why did it move stages?
03:45 What actually motivated us moving it from one place to another? Umm, especially with CSMs, if the deal owner changes from Pete to Jazz, or if it changes from Jazz to Parker, a new CSM is assigned.
04:01 Knowing the reason behind that, if the customer has been notified, if they even realize that somebody else is managing their account, can be a massive, umm, either a massive benefit to the client, or something that could really frustrate them, saying, hey, the main point of contact, we had a great relationship
04:18 with them. We can't talk to them anymore. We're, for some reason, it's not there. And, in HubSpot, it is- incredibly hard to see that.
04:27 Also, looking at any of these deals, why, or at what point was this added? Why is that? Who, who seats were added?
04:35 What is the expansion status of this client? Umm, so, it's really hard to try to find that information of when we contacted that person, how it happened.
04:46 So, Askelfen's actually giving me recommendations on- how I need to change, maybe even making a custom API solution to track that inside of HubSpot.
04:54 So, um, one last quick check here is, let's say I am jazz. Actually, let's just say that I have my own book of business, and I, from back when I did, and it's been two months since I last talked with my clients.
05:08 Who are my clients? How do I actually find the most impactful thing that I can do? Where are they at?
05:13 In my customer journey? Well, in their customer journey stage. The first thing is I want to know who, who's under my book of business in HubSpot again, I can come in, I can see deals under my name, I can come to the company's page, and I can see who's assigned to me, who's in my pipeline.
05:30 Um, but an Ask Elephant, well I think, well I go to customers. But there isn't any valuable information here. Or outside of their names.
05:40 So this isn't actually something that's going to help me. And on my events, I mean, I can filter this and I'll look at my external calls.
05:50 And maybe this is going to help me find, um, a little bit more information. Also, this is incredibly helpful. So you should start using it, but I'm just for the video.
05:59 I'm going to get rid of it. Alright, so. Now I can start to see some of the people that I met with.
06:04 Okay, Nick. So Nick at ObservePoint. So let's say that ObservePoint is one of my clients. Well, but I'm also seeing applause and Pylon.
06:12 Who's the most important one? Where are they actually at? Okay, so I'm going to go to ObservePoint. And I want to know where they're at in their customer journey.
06:22 I want to understand a little bit more information. Well. I can look through some of my workflows to get a general idea.
06:30 Um, I can see meetings that I've had, but I'm just going to ask, uh, where is ObservePoint in their customer journey?
06:37 What are next steps and how do I help them? Are they ready for expansion? Um, are they at turn risk?
06:45 So one problem here too, is that I actually don't know where this deal was sourced from. Who sold the account, what that sales cycle was like, what was promised to them, what they're expecting from us.
06:55 So I need actually, because I don't have that recall, I need to go through Askelf and start asking all of these questions just to try to get up to speed.
07:03 And then it could be that they're not even the most important client that I can be working with. Maybe it was applause.
07:08 So I'm going to come back and look again at applause. Uhm, so hopefully this gives a little bit better understanding of how I can do this.
07:20 I mean, I could make a workflow that goes through multiple companies, but again, can only pass in one company at a time.
07:27 So, um, I'm going to come to Askelf and I'm, I'm going to use our new, um, actually I'm going to use internal search because even this can be helpful.
07:37 Uh, go through the calls where I met with external clients and help me find out where they are in their customer journey and who's ready for expansion.
07:49 So, this is an incredibly powerful tool and it's going to make people much, much more efficient, but again, because I can't visually see, I can't actually work out of Aske elephant.
07:59 I can't go in and say, this is wa- where my clients are, who I own and know without really, really deep, umm, researcher information where they're actually at.
08:12 Um, I, I can't even figure out what my customer journey is. So, part of it is that I want to be able to say, this is what my customer journey is, where, where clients need to be going, what they're trying to get to, what I'm trying to drive, what my goals are, as, as a rep.
08:25 But also, what am I trying to help them with? So, this is going to take quite a while. I've already been at this for about five minutes, and I'm no closer to anything actionable than knowing observed point is one of my clients.
08:38 Like, that, that's, that's about the extent. And, uh, so this is taking me to my, my meeting page and I'll pull this up, but, um, again, this isn't about.
08:49 Internal surge, more than anything, it's, it's just how, how are we getting to this that I know where my customer isn't their journey?
08:56 So, we know that there's limitations inside of, um, hub spot to do this. And inside ask elephant, I want to be able to know what, what am I actually trying to drive?
09:08 What are the goals that I have? Is it 2.5 million? This month is 2.5 million. Do I have an expectation?
09:13 What's the number? Umm, what is it that my clients are trying to achieve? I had a really great conversation with, um, Jasmine around this exact idea and I'll send it over, um, about what, a customer map, what they're trying to drive to and us proving that our value is, is helping them get to, to their
09:38 . So, um, hopefully this is helpful. Skyler, let me know if you, you have any questions, um, that, again, this is a lot more the problem statement of, of, I don't know where my customer is and their journey.
09:51 I don't know who my customers are. I don't know what journey they're on right now. Um, and we're the outcome that we need to drive is that inside ask Elphin.
09:59 Um, I can. I can know who my customers are. I can know what that journey is and where they are on that path.
10:06 I'll see you