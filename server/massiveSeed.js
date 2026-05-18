require('dotenv').config();
const mongoose = require('mongoose');
const ReadingTest = require('./models/ReadingTest');
const ListeningTest = require('./models/ListeningTest');
const WritingTest = require('./models/WritingTest');
const SpeakingTest = require('./models/SpeakingTest');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ielts_prep';

// =========================================================================
// 1. DYNAMIC DATA FOR TESTS 11-30 (YOUR OLD QUESTIONS MERGED)
// =========================================================================
const allTopics = [
  "Global Trade", "Renewable Energy", "Deep Sea Exploration", "Roman Architecture", "Cognitive Psychology", 
  "AI in Healthcare", "Climate Change", "Language Evolution", "Quantum Computing", "Space Colonization",
  "Music Psychology", "Agriculture History", "Nanotechnology", "Urban Planning", "Bird Migration",
  "Cryptocurrency", "Renaissance Art", "Neuroplasticity", "Desert Ecosystems", "Industrial Revolution"
];

const getReadingQs = (topic) => [
  { number: 1, type: 'true_false_not_given', text: `1. The initial theories regarding ${topic} were proven entirely correct by modern science.`, options: ['True', 'False', 'Not Given'], correctAnswer: 'False' },
  { number: 2, type: 'true_false_not_given', text: `2. Funding for ${topic} research has doubled in the last five years.`, options: ['True', 'False', 'Not Given'], correctAnswer: 'Not Given' },
  { number: 3, type: 'true_false_not_given', text: `3. Archaeological discoveries forced scholars to rethink the timeline of ${topic}.`, options: ['True', 'False', 'Not Given'], correctAnswer: 'True' },
  { number: 4, type: 'true_false_not_given', text: `4. The general public is currently unaware of the implications of ${topic}.`, options: ['True', 'False', 'Not Given'], correctAnswer: 'False' },
  { number: 5, type: 'true_false_not_given', text: `5. Future progress in ${topic} relies heavily on international cooperation.`, options: ['True', 'False', 'Not Given'], correctAnswer: 'True' },
  { number: 6, type: 'multiple_choice', text: `6. What is the primary purpose of the first paragraph?`, options: ['To introduce historical context', 'To criticize older theories', 'To provide statistical data', 'To propose a new law'], correctAnswer: 'To introduce historical context' },
  { number: 7, type: 'multiple_choice', text: `7. According to the text, what was the main flaw of early 20th-century scholars?`, options: ['Lack of funding', 'Ignored structural evidence', 'Poor technology', 'Language barriers'], correctAnswer: 'Ignored structural evidence' },
  { number: 8, type: 'multiple_choice', text: `8. What does the word "unprecedented" refer to in the passage?`, options: ['The level of danger', 'The sudden surge in research', 'The cost of materials', 'The lack of interest'], correctAnswer: 'The sudden surge in research' },
  { number: 9, type: 'multiple_choice', text: `9. Which sector is most likely to be affected by ${topic} in the next decade?`, options: ['Agriculture', 'Global sustainability', 'Entertainment', 'Transportation'], correctAnswer: 'Global sustainability' },
  { number: 10, type: 'multiple_choice', text: `10. What is the author's overall tone regarding ${topic}?`, options: ['Pessimistic', 'Neutral', 'Optimistic and urgent', 'Sarcastic'], correctAnswer: 'Optimistic and urgent' },
  { number: 11, type: 'fill_in_the_blank', text: `11. Early scholars mistakenly believed that progress in this field was completely ______.`, correctAnswer: 'accidental' },
  { number: 12, type: 'fill_in_the_blank', text: `12. Recent evidence reveals that our ancestors used a highly ______ approach.`, correctAnswer: 'structured' },
  { number: 13, type: 'fill_in_the_blank', text: `13. The next decade will experience a significant increase in ______ for this sector.`, correctAnswer: 'funding' },
  { number: 14, type: 'fill_in_the_blank', text: `14. Local governments will need to adapt their strategies to handle new economic ______.`, correctAnswer: 'pressures' },
  { number: 15, type: 'fill_in_the_blank', text: `15. The ultimate goal of studying ${topic} is to improve scientific ______.`, correctAnswer: 'progress' }
];

// =========================================================================
// 2. LISTENING QUESTIONS (ALL 8 AUDIOS MERGED)
// =========================================================================
const libraryQuestions = [
  { number: 1, type: 'multiple_choice', text: '1. What is required to open a new library account?', options: ['Passport', 'Student ID', 'Utility Bill', 'Driver License'], correctAnswer: 'Student ID' },
  { number: 2, type: 'fill_in_the_blank', text: '2. The maximum number of books you can borrow is ______.', correctAnswer: 'five' },
  { number: 3, type: 'multiple_choice', text: '3. How much is the fine for a late return?', options: ['$1 per day', '$2 per day', '$5 flat fee', 'No fine'], correctAnswer: '$2 per day' },
  { number: 4, type: 'fill_in_the_blank', text: '4. The quiet study area is located on the ______ floor.', correctAnswer: 'second' },
  { number: 5, type: 'multiple_choice', text: '5. When does the library close on weekends?', options: ['5:00 PM', '8:00 PM', '10:00 PM', 'Midnight'], correctAnswer: '5:00 PM' },
  { number: 6, type: 'fill_in_the_blank', text: '6. To use the computers, you must sign in at the ______.', correctAnswer: 'desk' },
  { number: 7, type: 'multiple_choice', text: '7. Which section was recently renovated?', options: ['Childrens books', 'Reference', 'Archives', 'Cafeteria'], correctAnswer: 'Reference' },
  { number: 8, type: 'fill_in_the_blank', text: '8. You can reserve a study room up to a ______ in advance.', correctAnswer: 'week' },
  { number: 9, type: 'multiple_choice', text: '9. What happens if you lose a book?', options: ['Pay full price', 'Buy a replacement', 'Lose membership', 'Both A and B'], correctAnswer: 'Pay full price' },
  { number: 10, type: 'fill_in_the_blank', text: '10. The password for the Wi-Fi is updated every ______.', correctAnswer: 'month' },
  { number: 11, type: 'multiple_choice', text: '11. Where are the printers located?', options: ['Near the entrance', 'Next to the stairs', 'In the basement', 'Behind the desk'], correctAnswer: 'Next to the stairs' },
  { number: 12, type: 'fill_in_the_blank', text: '12. The library is closed on public ______.', correctAnswer: 'holidays' },
  { number: 13, type: 'multiple_choice', text: '13. Who can access the rare books archive?', options: ['Anyone', 'Undergraduates', 'Postgraduates only', 'Staff only'], correctAnswer: 'Postgraduates only' },
  { number: 14, type: 'fill_in_the_blank', text: '14. Audiobooks can be downloaded via the library ______.', correctAnswer: 'app' },
  { number: 15, type: 'multiple_choice', text: '15. What event happens every Tuesday?', options: ['Book club', 'Author signing', 'IT workshop', 'Movie screening'], correctAnswer: 'Book club' }
];

const museumQuestions = [
  { number: 1, type: 'multiple_choice', text: '1. What time does the guided tour begin?', options: ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM'], correctAnswer: '10:00 AM' },
  { number: 2, type: 'fill_in_the_blank', text: '2. Photography is strictly prohibited in the ______ exhibit.', correctAnswer: 'egyptian' },
  { number: 3, type: 'multiple_choice', text: '3. Where should visitors leave their backpacks?', options: ['Cloakroom', 'Reception', 'Cafeteria', 'On the bus'], correctAnswer: 'Cloakroom' },
  { number: 4, type: 'fill_in_the_blank', text: '4. The museum was founded in the year ______.', correctAnswer: '1895' },
  { number: 5, type: 'multiple_choice', text: '5. Which exhibit is temporary?', options: ['Dinosaur bones', 'Modern Art', 'Roman coins', 'Space exploration'], correctAnswer: 'Modern Art' },
  { number: 6, type: 'fill_in_the_blank', text: '6. The gift shop is located next to the main ______.', correctAnswer: 'exit' },
  { number: 7, type: 'multiple_choice', text: '7. How long does the tour typically last?', options: ['45 minutes', '1 hour', '90 minutes', '2 hours'], correctAnswer: '90 minutes' },
  { number: 8, type: 'fill_in_the_blank', text: '8. Please do not touch the ______ on display.', correctAnswer: 'artifacts' },
  { number: 9, type: 'multiple_choice', text: '9. What is the theme of the south wing?', options: ['Technology', 'Natural History', 'Aviation', 'Local folklore'], correctAnswer: 'Natural History' },
  { number: 10, type: 'fill_in_the_blank', text: '10. Students can get a discount if they show their ______.', correctAnswer: 'card' },
  { number: 11, type: 'multiple_choice', text: '11. What is included in the premium ticket?', options: ['Free lunch', 'Audio guide', 'Souvenir', 'Parking'], correctAnswer: 'Audio guide' },
  { number: 12, type: 'fill_in_the_blank', text: '12. The interactive screens are currently out of ______.', correctAnswer: 'order' },
  { number: 13, type: 'multiple_choice', text: '13. Who donated the diamond collection?', options: ['A local family', 'The government', 'A foreign king', 'An anonymous donor'], correctAnswer: 'A local family' },
  { number: 14, type: 'fill_in_the_blank', text: '14. The cafe is located on the ______ floor.', correctAnswer: 'top' },
  { number: 15, type: 'multiple_choice', text: '15. Where is the meeting point if you get lost?', options: ['Fountain', 'Entrance desk', 'Statue', 'Restrooms'], correctAnswer: 'Fountain' }
];

const researchQuestions = [
  { number: 1, type: 'multiple_choice', text: '1. What is the main objective of the research project?', options: ['Analyze water quality', 'Study bird migration', 'Measure pollution', 'Test solar panels'], correctAnswer: 'Measure pollution' },
  { number: 2, type: 'fill_in_the_blank', text: '2. The deadline for the first draft is next ______.', correctAnswer: 'friday' },
  { number: 3, type: 'multiple_choice', text: '3. Who is the lead supervisor for this assignment?', options: ['Dr. Smith', 'Prof. Johnson', 'Dr. Lee', 'Ms. Davis'], correctAnswer: 'Dr. Smith' },
  { number: 4, type: 'fill_in_the_blank', text: '4. The students must collect samples from the ______.', correctAnswer: 'river' },
  { number: 5, type: 'multiple_choice', text: '5. How many people should be in each group?', options: ['Two', 'Three', 'Four', 'Five'], correctAnswer: 'Three' },
  { number: 6, type: 'fill_in_the_blank', text: '6. All data must be entered into the shared ______.', correctAnswer: 'spreadsheet' },
  { number: 7, type: 'multiple_choice', text: '7. What software will they use for analysis?', options: ['Excel', 'SPSS', 'Python', 'Tableau'], correctAnswer: 'SPSS' },
  { number: 8, type: 'fill_in_the_blank', text: '8. The final presentation will count for ______ percent of the grade.', correctAnswer: 'forty' },
  { number: 9, type: 'multiple_choice', text: '9. What should students do if equipment breaks?', options: ['Fix it', 'Buy a new one', 'Report it immediately', 'Ignore it'], correctAnswer: 'Report it immediately' },
  { number: 10, type: 'fill_in_the_blank', text: '10. The lab is open until ______ PM on weekdays.', correctAnswer: 'nine' },
  { number: 11, type: 'multiple_choice', text: '11. Which chapter of the textbook is most relevant?', options: ['Chapter 3', 'Chapter 5', 'Chapter 7', 'Chapter 9'], correctAnswer: 'Chapter 5' },
  { number: 12, type: 'fill_in_the_blank', text: '12. Students must wear safety ______ at all times in the lab.', correctAnswer: 'goggles' },
  { number: 13, type: 'multiple_choice', text: '13. Where will the final presentations be held?', options: ['Room 101', 'Main Hall', 'Library', 'Science Block'], correctAnswer: 'Room 101' },
  { number: 14, type: 'fill_in_the_blank', text: '14. You need to include at least ten academic ______.', correctAnswer: 'references' },
  { number: 15, type: 'multiple_choice', text: '15. What is the penalty for late submission?', options: ['5% deduction', '10% deduction', 'Zero marks', 'No penalty'], correctAnswer: '10% deduction' }
];

const lectureQuestions = [
  { number: 1, type: 'multiple_choice', text: '1. What specific branch of biology is the lecture about?', options: ['Genetics', 'Ecology', 'Cellular biology', 'Botany'], correctAnswer: 'Cellular biology' },
  { number: 2, type: 'fill_in_the_blank', text: '2. The nucleus is often referred to as the ______ of the cell.', correctAnswer: 'brain' },
  { number: 3, type: 'multiple_choice', text: '3. Which organelle produces energy?', options: ['Ribosome', 'Mitochondria', 'Vacuole', 'Golgi apparatus'], correctAnswer: 'Mitochondria' },
  { number: 4, type: 'fill_in_the_blank', text: '4. Plant cells have a rigid cell ______.', correctAnswer: 'wall' },
  { number: 5, type: 'multiple_choice', text: '5. What process was discovered in 1839?', options: ['Photosynthesis', 'Mitosis', 'Respiration', 'Osmosis'], correctAnswer: 'Mitosis' },
  { number: 6, type: 'fill_in_the_blank', text: '6. The professor mentioned an experiment involving ______.', correctAnswer: 'mice' },
  { number: 7, type: 'multiple_choice', text: '7. What is the main function of chloroplasts?', options: ['Storage', 'Energy conversion', 'Reproduction', 'Defense'], correctAnswer: 'Energy conversion' },
  { number: 8, type: 'fill_in_the_blank', text: '8. Human DNA is primarily stored in the ______.', correctAnswer: 'nucleus' },
  { number: 9, type: 'multiple_choice', text: '9. Who first observed cells under a microscope?', options: ['Newton', 'Darwin', 'Hooke', 'Pasteur'], correctAnswer: 'Hooke' },
  { number: 10, type: 'fill_in_the_blank', text: '10. The upcoming midterm will focus on chapters one through ______.', correctAnswer: 'four' },
  { number: 11, type: 'multiple_choice', text: '11. What liquid makes up most of the cytoplasm?', options: ['Acid', 'Water', 'Protein', 'Lipids'], correctAnswer: 'Water' },
  { number: 12, type: 'fill_in_the_blank', text: '12. Mutations occur when there is an error in the ______.', correctAnswer: 'dna' },
  { number: 13, type: 'multiple_choice', text: '13. How do single-celled organisms reproduce?', options: ['Meiosis', 'Binary fission', 'Budding', 'All of the above'], correctAnswer: 'Binary fission' },
  { number: 14, type: 'fill_in_the_blank', text: '14. The membrane is semi-______.', correctAnswer: 'permeable' },
  { number: 15, type: 'multiple_choice', text: '15. What is the topic for next week’s lecture?', options: ['Viruses', 'Bacteria', 'Fungi', 'Evolution'], correctAnswer: 'Viruses' }
];

const clinicQuestions = [
  { number: 1, type: 'multiple_choice', text: '1. What is the name of the clinic?', options: ['A) Wellington Road Clinic', 'B) Wellington Street Health Clinic', 'C) West Street Health Centre', 'D) Wellington Medical Hospital'], correctAnswer: 'B) Wellington Street Health Clinic' },
  { number: 2, type: 'multiple_choice', text: '2. Why does the patient call the clinic?', options: ['A) To ask about opening hours', 'B) To complain about a bill', 'C) To register and make an appointment', 'D) To request medical records'], correctAnswer: 'C) To register and make an appointment' },
  { number: 3, type: 'multiple_choice', text: '3. How long has the patient had a cough?', options: ['A) One week', 'B) Two weeks', 'C) Three days', 'D) One month'], correctAnswer: 'B) Two weeks' },
  { number: 4, type: 'multiple_choice', text: '4. What is the patient’s date of birth?', options: ['A) 21st August 1995', 'B) 12th July 1995', 'C) 12th August 1995', 'D) 22nd August 1996'], correctAnswer: 'C) 12th August 1995' },
  { number: 5, type: 'multiple_choice', text: '5. Which document does the receptionist request?', options: ['A) Birth certificate', 'B) Bank statement', 'C) Utility bill', 'D) Photo ID'], correctAnswer: 'D) Photo ID' },
  { number: 6, type: 'multiple_choice', text: '6. Which ID does the patient provide?', options: ['A) Passport', 'B) Driver\'s license', 'C) Student card', 'D) National ID card'], correctAnswer: 'B) Driver\'s license' },
  { number: 7, type: 'multiple_choice', text: '7. What is the initial consultation fee?', options: ['A) £35', 'B) £40', 'C) £45', 'D) £50'], correctAnswer: 'C) £45' },
  { number: 8, type: 'multiple_choice', text: '8. How can the patient pay the fee?', options: ['A) Only cash', 'B) Only card', 'C) Card or cash', 'D) Online transfer only'], correctAnswer: 'C) Card or cash' },
  { number: 9, type: 'multiple_choice', text: '9. Which doctor is fully booked?', options: ['A) Dr. Evans', 'B) Dr. Brown', 'C) Dr. Smith', 'D) Dr. Taylor'], correctAnswer: 'C) Dr. Smith' },
  { number: 10, type: 'multiple_choice', text: '10. Which doctor is available?', options: ['A) Dr. Smith', 'B) Dr. Evans', 'C) Dr. Green', 'D) Dr. White'], correctAnswer: 'B) Dr. Evans' },
  { number: 11, type: 'multiple_choice', text: '11. When is the appointment scheduled?', options: ['A) Wednesday at 9:00 AM', 'B) Thursday at 10:15 AM', 'C) Friday at 10:15 AM', 'D) Thursday at 11:00 AM'], correctAnswer: 'B) Thursday at 10:15 AM' },
  { number: 12, type: 'multiple_choice', text: '12. How much notice is required to cancel the appointment?', options: ['A) 12 hours', 'B) 24 hours', 'C) 48 hours', 'D) 72 hours'], correctAnswer: 'B) 24 hours' },
  { number: 13, type: 'multiple_choice', text: '13. What should the patient bring to the appointment?', options: ['A) Insurance papers', 'B) Passport photos', 'C) Past medical history documents', 'D) Prescription medicines'], correctAnswer: 'C) Past medical history documents' },
  { number: 14, type: 'multiple_choice', text: '14. Where is the parking lot located?', options: ['A) In front of the clinic', 'B) Next to the pharmacy', 'C) Behind the supermarket next door', 'D) Across the street'], correctAnswer: 'C) Behind the supermarket next door' },
  { number: 15, type: 'multiple_choice', text: '15. Until what time is the on-site pharmacy open?', options: ['A) 5 PM', 'B) 6 PM', 'C) 7 PM', 'D) 8 PM'], correctAnswer: 'B) 6 PM' }
];

const wildlifeQuestions = [
  { number: 1, type: 'multiple_choice', text: '1. What is the name of the wildlife park?', options: ['A. Greenfield Nature Park', 'B. Oakwood Wildlife Park', 'C. Lakeview Safari Park', 'D. Central Animal Reserve'], correctAnswer: 'B. Oakwood Wildlife Park' },
  { number: 2, type: 'multiple_choice', text: '2. What is the name of the tour guide?', options: ['A. Daniel', 'B. Michael', 'C. David', 'D. Robert'], correctAnswer: 'C. David' },
  { number: 3, type: 'multiple_choice', text: '3. Visitors are not allowed to feed the animals because:', options: ['A. It is expensive', 'B. The animals may become aggressive', 'C. The animals have specific diets', 'D. It is only allowed in winter'], correctAnswer: 'C. The animals have specific diets' },
  { number: 4, type: 'multiple_choice', text: '4. The park was originally:', options: ['A. A zoo', 'B. A botanical garden', 'C. A rescue center', 'D. A picnic area'], correctAnswer: 'C. A rescue center' },
  { number: 5, type: 'multiple_choice', text: '5. In which year was the park established?', options: ['A. 1975', 'B. 1985', 'C. 1995', 'D. 2005'], correctAnswer: 'B. 1985' },
  { number: 6, type: 'multiple_choice', text: '6. The walking trail is:', options: ['A. 1.5 kilometers long', 'B. 2 kilometers long', 'C. 2.5 kilometers long', 'D. 3 kilometers long'], correctAnswer: 'C. 2.5 kilometers long' },
  { number: 7, type: 'multiple_choice', text: '7. The walking trail goes around:', options: ['A. The mountains', 'B. The forest', 'C. The parking area', 'D. The central lake'], correctAnswer: 'D. The central lake' },
  { number: 8, type: 'multiple_choice', text: '8. The Safari Bus departs from:', options: ['A. The Main Entrance', 'B. The South Gate', 'C. The North Gate', 'D. The Picnic Area'], correctAnswer: 'C. The North Gate' },
  { number: 9, type: 'multiple_choice', text: '9. How often does the Safari Bus depart?', options: ['A. Every 30 minutes', 'B. Every hour', 'C. Twice a day', 'D. Every two hours'], correctAnswer: 'B. Every hour' },
  { number: 10, type: 'multiple_choice', text: '10. The bird show takes place at:', options: ['A. 12:00 PM', 'B. 1:00 PM', 'C. 2:00 PM', 'D. 3:00 PM'], correctAnswer: 'C. 2:00 PM' },
  { number: 11, type: 'multiple_choice', text: '11. The new attraction that opened last week is:', options: ['A. The Lion’s Den', 'B. The Reptile House', 'C. The Butterfly Tent', 'D. The Aquarium Hall'], correctAnswer: 'C. The Butterfly Tent' },
  { number: 12, type: 'multiple_choice', text: '12. Visitors can eat their lunch:', options: ['A. On the bus', 'B. Near the enclosures', 'C. Anywhere in the park', 'D. In the Picnic Area'], correctAnswer: 'D. In the Picnic Area' },
  { number: 13, type: 'multiple_choice', text: '13. In case of emergency, visitors should go to:', options: ['A. The Safari Bus', 'B. The Security Office', 'C. The Gift Shop', 'D. The Amphitheater'], correctAnswer: 'B. The Security Office' },
  { number: 14, type: 'multiple_choice', text: '14. During summer, the park closes at:', options: ['A. 6 PM', 'B. 7 PM', 'C. 8 PM', 'D. 9 PM'], correctAnswer: 'B. 7 PM' },
  { number: 15, type: 'multiple_choice', text: '15. What special product does the gift shop sell?', options: ['A. Handmade toys', 'B. Organic vegetables', 'C. Local honey', 'D. Animal paintings'], correctAnswer: 'C. Local honey' }
];

const gymQuestions = [
  { number: 1, type: 'multiple_choice', text: '1. What is the name of the gym?', options: ['A) Fitness Pro Gym', 'B) FitLife Gym', 'C) Flex Gym', 'D) LifeStyle Fitness'], correctAnswer: 'B) FitLife Gym' },
  { number: 2, type: 'multiple_choice', text: '2. Why is Anna calling the gym?', options: ['A) To cancel her membership', 'B) To book a personal trainer', 'C) To ask about membership options', 'D) To complain about facilities'], correctAnswer: 'C) To ask about membership options' },
  { number: 3, type: 'multiple_choice', text: '3. What are the two types of memberships offered?', options: ['A) Weekly and monthly', 'B) Monthly and annual', 'C) Annual and lifetime', 'D) Student and corporate'], correctAnswer: 'B) Monthly and annual' },
  { number: 4, type: 'multiple_choice', text: '4. How much does the monthly membership cost?', options: ['A) £40', 'B) £45', 'C) £50', 'D) £55'], correctAnswer: 'B) £45' },
  { number: 5, type: 'multiple_choice', text: '5. What is the cost of the annual membership?', options: ['A) £420', 'B) £450', 'C) £480', 'D) £500'], correctAnswer: 'C) £480' },
  { number: 6, type: 'multiple_choice', text: '6. How much money can Anna save by choosing the annual membership?', options: ['A) £45', 'B) £50', 'C) £60', 'D) £80'], correctAnswer: 'C) £60' },
  { number: 7, type: 'multiple_choice', text: '7. Which of the following facilities is mentioned?', options: ['A) Sauna', 'B) Basketball court', 'C) Swimming pool', 'D) Tennis court'], correctAnswer: 'C) Swimming pool' },
  { number: 8, type: 'multiple_choice', text: '8. Are yoga classes included in the membership?', options: ['A) No, they cost extra', 'B) Only for annual members', 'C) Yes, they are included', 'D) Only on weekends'], correctAnswer: 'C) Yes, they are included' },
  { number: 9, type: 'multiple_choice', text: '9. How much does a personal training session cost?', options: ['A) £20', 'B) £25', 'C) £30', 'D) £35'], correctAnswer: 'B) £25' },
  { number: 10, type: 'multiple_choice', text: '10. What time does the gym open on weekdays?', options: ['A) 5:00 AM', 'B) 6:00 AM', 'C) 7:00 AM', 'D) 8:00 AM'], correctAnswer: 'B) 6:00 AM' },
  { number: 11, type: 'multiple_choice', text: '11. What time does the gym close on weekdays?', options: ['A) 9:00 PM', 'B) 10:00 PM', 'C) 8:00 PM', 'D) 11:00 PM'], correctAnswer: 'B) 10:00 PM' },
  { number: 12, type: 'multiple_choice', text: '12. What are the weekend opening hours?', options: ['A) 6:00 AM – 10:00 PM', 'B) 7:00 AM – 9:00 PM', 'C) 8:00 AM – 8:00 PM', 'D) 9:00 AM – 6:00 PM'], correctAnswer: 'C) 8:00 AM – 8:00 PM' },
  { number: 13, type: 'multiple_choice', text: '13. What is Anna’s full name?', options: ['A) Anna Wilson', 'B) Anna Williams', 'C) Anna Brown', 'D) Anna Smith'], correctAnswer: 'B) Anna Williams' },
  { number: 14, type: 'multiple_choice', text: '14. What is Anna’s date of birth?', options: ['A) 4th March 1998', 'B) 14th April 1998', 'C) 14th March 1998', 'D) 24th March 1999'], correctAnswer: 'C) 14th March 1998' },
  { number: 15, type: 'multiple_choice', text: '15. When will Anna’s membership start?', options: ['A) Today', 'B) Tomorrow', 'C) Next Monday', 'D) Next weekend'], correctAnswer: 'C) Next Monday' }
];

const brainQuestions = [
  { number: 1, type: 'multiple_choice', text: '1. What is the lecture mainly about?', options: ['A. Mental health disorders', 'B. Brain surgery techniques', 'C. The structure and function of the human brain', 'D. Human evolution'], correctAnswer: 'C. The structure and function of the human brain' },
  { number: 2, type: 'multiple_choice', text: '2. The brain consists of how many main parts?', options: ['A. Two', 'B. Three', 'C. Four', 'D. Five'], correctAnswer: 'B. Three' },
  { number: 3, type: 'multiple_choice', text: '3. Which of the following is NOT mentioned as a main part of the brain?', options: ['A. Cerebrum', 'B. Cerebellum', 'C. Brainstem', 'D. Spinal cord'], correctAnswer: 'D. Spinal cord' },
  { number: 4, type: 'multiple_choice', text: '4. Which part of the brain is the largest?', options: ['A. Cerebellum', 'B. Brainstem', 'C. Cerebrum', 'D. Spinal cord'], correctAnswer: 'C. Cerebrum' },
  { number: 5, type: 'multiple_choice', text: '5. The cerebrum controls:', options: ['A. Digestion and sleep', 'B. Thinking and memory', 'C. Blood circulation', 'D. Body temperature'], correctAnswer: 'B. Thinking and memory' },
  { number: 6, type: 'multiple_choice', text: '6. Which function is controlled by the cerebrum?', options: ['A. Balance', 'B. Heartbeat', 'C. Voluntary movement', 'D. Reflex actions only'], correctAnswer: 'C. Voluntary movement' },
  { number: 7, type: 'multiple_choice', text: '7. The cerebellum is mainly responsible for:', options: ['A. Emotions', 'B. Coordination', 'C. Memory', 'D. Breathing'], correctAnswer: 'B. Coordination' },
  { number: 8, type: 'multiple_choice', text: '8. Which part of the brain controls breathing?', options: ['A. Cerebrum', 'B. Cerebellum', 'C. Brainstem', 'D. Frontal lobe'], correctAnswer: 'C. Brainstem' },
  { number: 9, type: 'multiple_choice', text: '9. The brainstem controls:', options: ['A. Voluntary movements only', 'B. Essential life functions', 'C. Emotions only', 'D. Memory storage'], correctAnswer: 'B. Essential life functions' },
  { number: 10, type: 'multiple_choice', text: '10. Which of the following is an essential life function mentioned?', options: ['A. Thinking', 'B. Coordination', 'C. Heart rate', 'D. Learning'], correctAnswer: 'C. Heart rate' },
  { number: 11, type: 'multiple_choice', text: '11. Approximately how many neurons does the human brain contain?', options: ['A. 8 billion', 'B. 60 billion', 'C. 86 billion', 'D. 100 billion'], correctAnswer: 'C. 86 billion' },
  { number: 12, type: 'multiple_choice', text: '12. Neuroscientists study the brain to:', options: ['A. Increase intelligence', 'B. Develop new computers', 'C. Improve memory techniques', 'D. Develop treatments for neurological disorders'], correctAnswer: 'D. Develop treatments for neurological disorders' },
  { number: 13, type: 'multiple_choice', text: '13. Which disease is mentioned in the lecture?', options: ['A. Diabetes', 'B. Alzheimer’s disease', 'C. Asthma', 'D. Cancer'], correctAnswer: 'B. Alzheimer’s disease' },
  { number: 14, type: 'multiple_choice', text: '14. Parkinson’s disease is an example of:', options: ['A. A viral infection', 'B. A neurological disorder', 'C. A heart condition', 'D. A lung disease'], correctAnswer: 'B. A neurological disorder' },
  { number: 15, type: 'multiple_choice', text: '15. Understanding the brain helps scientists primarily to:', options: ['A. Improve sports performance', 'B. Design robots', 'C. Cure all illnesses', 'D. Create better medical treatments'], correctAnswer: 'D. Create better medical treatments' }
];

// =========================================================================
// 3. HARDCODED READING DATA (TESTS 1-10)
// =========================================================================
const getReadingCorrectAnswerStr = (optionsArray, letter) => {
  if (letter === 'A') return optionsArray[0];
  if (letter === 'B') return optionsArray[1];
  if (letter === 'C') return optionsArray[2];
  if (letter === 'D') return optionsArray[3];
  return optionsArray[0];
};

const rawReadingData = [
  {
    title: 'The Rise of Artificial Intelligence in the Workplace',
    text: `Artificial Intelligence (AI) has rapidly transformed modern workplaces across the globe. Over the past decade, companies have increasingly adopted AI-driven systems to improve efficiency, reduce operational costs, and enhance decision-making processes. From automated customer service chatbots to advanced data analytics tools, AI technologies are reshaping how businesses operate.\n\nOne major advantage of AI is its ability to process vast amounts of data in a short period of time. Traditional data analysis methods often require significant human effort and time, whereas AI algorithms can detect patterns and generate insights within seconds. This capability has proven particularly valuable in sectors such as finance, healthcare, and logistics.\n\nHowever, the integration of AI has also raised concerns about job displacement. Many routine and repetitive tasks are now performed by machines, leading some experts to predict a reduction in demand for certain types of labor. Despite these concerns, studies suggest that AI may create new employment opportunities that require advanced technical and analytical skills.\n\nFurthermore, organizations investing in AI must consider ethical issues, including data privacy and algorithmic bias. Ensuring transparency and accountability in AI systems has become a priority for policymakers and business leaders alike. As AI continues to evolve, its long-term impact on employment and economic growth remains a topic of ongoing debate.`,
    qs: ['1. What is the main purpose of the passage?', '2. According to the passage, why do companies adopt AI systems?', '3. Which sector is specifically mentioned as benefiting from AI data analysis?', '4. What is a key advantage of AI over traditional data analysis?', '5. What concern is associated with AI integration?', '6. What type of tasks are most likely to be replaced by AI?', '7. What do some studies suggest about AI and employment?', '8. What ethical issue related to AI is mentioned?', '9. Why is transparency important in AI systems?', '10. How has AI affected decision-making processes?', '11. What is the tone of the passage?', '12. What is suggested about the future impact of AI?', '13. Who is responsible for addressing AI-related ethical issues?', '14. What is one potential benefit of AI for businesses?', '15. Which statement best describes the overall argument of the passage?'],
    opts: [['A. To criticize AI development', 'B. To explain the history of computing', 'C. To discuss the impact of AI in workplaces', 'D. To describe one specific AI software'], ['A. To increase employee workload', 'B. To improve efficiency and reduce costs', 'C. To eliminate all human workers', 'D. To avoid ethical issues'], ['A. Agriculture', 'B. Education', 'C. Finance', 'D. Tourism'], ['A. Lower electricity usage', 'B. Faster data processing', 'C. Better office design', 'D. Higher salaries'], ['A. Increased holidays', 'B. Job displacement', 'C. Office relocation', 'D. Higher taxes'], ['A. Creative tasks', 'B. Leadership roles', 'C. Routine and repetitive tasks', 'D. Strategic planning'], ['A. AI will eliminate all jobs', 'B. AI creates no new roles', 'C. AI may create new skilled jobs', 'D. AI reduces technical skills'], ['A. Office design', 'B. Marketing strategies', 'C. Data privacy and bias', 'D. Employee uniforms'], ['A. To reduce machine speed', 'B. To ensure accountability', 'C. To increase profits only', 'D. To avoid electricity costs'], ['A. Made it slower', 'B. Had no effect', 'C. Enhanced it through data insights', 'D. Removed it completely'], ['A. Highly emotional', 'B. Completely negative', 'C. Balanced and analytical', 'D. Humorous'], ['A. It is fully predictable', 'B. It remains uncertain', 'C. It will end soon', 'D. It has no impact'], ['A. Students only', 'B. Policymakers and business leaders', 'C. Tourists', 'D. Farmers'], ['A. Increased manual work', 'B. Improved operational efficiency', 'C. Reduced communication', 'D. Higher rent costs'], ['A. AI is entirely harmful', 'B. AI has both benefits and challenges', 'C. AI should be banned', 'D. AI only affects finance']],
    ansLetters: ['C', 'B', 'C', 'B', 'B', 'C', 'C', 'C', 'B', 'C', 'C', 'B', 'B', 'B', 'B']
  },
  {
    title: 'Urban Green Spaces and Mental Health',
    text: `In recent decades, rapid urbanization has significantly reduced the availability of natural environments within cities. High-rise buildings, expanding transportation networks, and commercial developments have replaced many parks and open spaces. As a result, concerns have emerged regarding the impact of this transformation on public well-being.\n\nResearch indicates that access to urban green spaces, such as parks, gardens, and tree-lined streets, plays a crucial role in improving mental health. Exposure to natural environments has been linked to reduced stress levels, improved concentration, and enhanced mood. Studies conducted in several metropolitan areas have demonstrated that individuals who regularly visit green spaces report lower levels of anxiety and depression.\n\nMoreover, green spaces encourage physical activity and social interaction. Public parks often serve as gathering points where communities engage in recreational activities, strengthening social bonds. This sense of connection can further contribute to psychological well-being.\n\nDespite these benefits, maintaining urban green spaces presents challenges. Limited land availability and financial constraints often lead city planners to prioritize commercial projects over environmental preservation. However, experts argue that integrating nature into urban planning is essential for sustainable development.\n\nAs cities continue to grow, policymakers face the difficult task of balancing economic progress with environmental and social needs. The long-term health of urban populations may depend on how effectively this balance is achieved.`,
    qs: ['1. What is the main focus of the passage?', '2. What has replaced many parks in urban areas?', '3. According to research, what is one mental health benefit of green spaces?', '4. How do green spaces affect stress levels?', '5. What additional benefit do green spaces provide besides mental health support?', '6. Why are green spaces important for community life?', '7. What psychological conditions are mentioned in the passage?', '8. What challenge do city planners face?', '9. Why are commercial projects often prioritized?', '10. What is necessary for sustainable urban development?', '11. What is the tone of the passage?', '12. What does the passage suggest about future urban growth?', '13. What role do policymakers play?', '14. What is one consequence of reduced green spaces?', '15. Which statement best summarizes the author’s argument?'],
    opts: [['A. The history of city architecture', 'B. The importance of urban green spaces for mental health', 'C. The economic benefits of skyscrapers', 'D. The design of transportation systems'], ['A. Agricultural farms', 'B. Industrial factories only', 'C. Buildings and infrastructure', 'D. Beaches'], ['A. Increased stress', 'B. Reduced stress', 'C. Financial improvement', 'D. Higher population'], ['A. They increase stress', 'B. They have no effect', 'C. They reduce stress', 'D. They eliminate all problems'], ['A. Increased pollution', 'B. Encouragement of physical activity', 'C. Reduced transportation', 'D. Office expansion'], ['A. They create isolation', 'B. They strengthen social bonds', 'C. They reduce communication', 'D. They increase traffic'], ['A. Anxiety and depression', 'B. Diabetes and cancer', 'C. Obesity and asthma', 'D. Headaches and fever'], ['A. Excess farmland', 'B. Limited land and financial constraints', 'C. Too many parks', 'D. Lack of technology'], ['A. Because they generate economic profit', 'B. Because they improve health directly', 'C. Because they reduce population', 'D. Because they are environmentally friendly'], ['A. Removing parks', 'B. Ignoring mental health', 'C. Integrating nature into planning', 'D. Increasing traffic systems'], ['A. Emotional and biased', 'B. Balanced and informative', 'C. Completely negative', 'D. Humorous'], ['A. Cities will stop growing', 'B. Growth requires balancing priorities', 'C. Green spaces are unnecessary', 'D. Urban life will disappear'], ['A. Ignoring environmental issues', 'B. Balancing economic and social needs', 'C. Eliminating public parks', 'D. Increasing commercial taxes'], ['A. Improved mental health', 'B. Increased well-being', 'C. Greater anxiety levels', 'D. More exercise'], ['A. Green spaces are a luxury', 'B. Economic growth is more important than health', 'C. Urban green spaces are essential for long-term well-being', 'D. Parks should only be built in villages']],
    ansLetters: ['B', 'C', 'B', 'C', 'B', 'B', 'A', 'B', 'A', 'C', 'B', 'B', 'B', 'C', 'C']
  },
  {
    title: 'The Evolution of Renewable Energy Technologies',
    text: `Over the past century, global dependence on fossil fuels has significantly shaped economic development and industrial growth. However, increasing awareness of climate change and environmental degradation has accelerated the search for renewable energy alternatives. Renewable energy sources, including solar, wind, hydroelectric, and geothermal power, are now central to global sustainability strategies.\n\nInitially, renewable technologies faced skepticism due to high installation costs and limited efficiency. Early solar panels, for instance, converted only a small fraction of sunlight into usable electricity. Similarly, wind turbines were criticized for their inconsistent output, as energy production depended heavily on weather conditions.\n\nAdvancements in materials science and engineering have dramatically improved efficiency levels. Modern photovoltaic cells can generate substantially more power than their predecessors, while large-scale offshore wind farms now contribute significantly to national grids. In addition, battery storage technologies have addressed concerns regarding energy reliability by enabling excess energy to be stored for later use.\n\nDespite these technological improvements, challenges remain. The transition to renewable energy requires substantial infrastructure investment and policy support. Furthermore, some critics argue that renewable systems alone may not meet global energy demands without complementary solutions.\n\nNevertheless, many experts maintain that continued innovation and international cooperation will accelerate the shift toward cleaner energy systems. The evolution of renewable energy technologies illustrates how scientific progress can reshape global economic and environmental priorities.`,
    qs: ['1. What is the main theme of the passage?', '2. Why has interest in renewable energy increased?', '3. What was an early limitation of solar panels?', '4. Why were wind turbines initially criticized?', '5. What field contributed to improved renewable efficiency?', '6. How have battery storage technologies helped?', '7. What remains a major challenge in adopting renewable energy?', '8. What do some critics believe about renewable systems?', '9. What role does policy play in the transition?', '10. What does the passage suggest about innovation?', '11. What is the author’s overall attitude toward renewable energy?', '12. Which renewable sources are mentioned in the passage?', '13. What impact have offshore wind farms had?', '14. What broader lesson does the evolution of renewable energy demonstrate?', '15. Which statement best summarizes the passage?'],
    opts: [['A. The history of fossil fuels', 'B. The development and challenges of renewable energy', 'C. The decline of industrial growth', 'D. The design of wind turbines'], ['A. Decreasing oil prices', 'B. Climate change concerns', 'C. Reduced electricity demand', 'D. Government bans on solar power'], ['A. High pollution levels', 'B. Limited sunlight', 'C. Low conversion efficiency', 'D. Expensive maintenance'], ['A. They were too large', 'B. They depended on weather conditions', 'C. They produced nuclear waste', 'D. They required no maintenance'], ['A. Medicine', 'B. Agriculture', 'C. Materials science and engineering', 'D. Tourism'], ['A. Reduced installation costs', 'B. Eliminated fossil fuels completely', 'C. Improved energy reliability', 'D. Increased wind speed'], ['A. Lack of sunlight', 'B. Infrastructure investment and policy support', 'C. Public interest decline', 'D. Overproduction of energy'], ['A. Renewables are fully sufficient now', 'B. Fossil fuels are renewable', 'C. Renewables alone may not meet all demands', 'D. Solar power is illegal'], ['A. It is unnecessary', 'B. It slows development', 'C. It supports infrastructure transition', 'D. It replaces technology'], ['A. Innovation is irrelevant', 'B. Innovation slows progress', 'C. Innovation drives cleaner energy transition', 'D. Innovation increases pollution'], ['A. Strongly negative', 'B. Neutral and indifferent', 'C. Cautiously optimistic', 'D. Completely critical'], ['A. Solar, wind, hydroelectric, geothermal', 'B. Coal and oil', 'C. Nuclear only', 'D. Biomass only'], ['A. Reduced national energy supply', 'B. Contributed significantly to national grids', 'C. Caused power shortages', 'D. Replaced all fossil fuels'], ['A. Scientific progress can reshape priorities', 'B. Technology never changes', 'C. Fossil fuels are permanent', 'D. Energy demand is declining'], ['A. Renewable energy has no future', 'B. Fossil fuels remain the only solution', 'C. Renewable energy is evolving but still faces challenges', 'D. Wind energy is the best source']],
    ansLetters: ['B', 'B', 'C', 'B', 'C', 'C', 'B', 'C', 'C', 'C', 'C', 'A', 'B', 'A', 'C']
  },
  {
    title: 'The Psychology of Decision-Making',
    text: `Decision-making is a fundamental cognitive process that influences nearly every aspect of human behavior. From everyday choices such as selecting a meal to complex judgments involving financial investments or medical treatments, individuals constantly evaluate information before reaching conclusions. While many assume that decisions are made purely through rational analysis, psychological research suggests that emotions and cognitive biases often play a significant role.\n\nOne influential theory proposes that the human brain operates using two distinct systems. The first system is fast, automatic, and intuitive. It allows individuals to make quick judgments with minimal effort. The second system is slower, analytical, and deliberate, requiring conscious reasoning and evaluation of evidence. Although the analytical system is capable of more accurate conclusions, it demands greater mental effort and is therefore used less frequently.\n\nCognitive biases further complicate decision-making. For example, confirmation bias leads individuals to favor information that supports their existing beliefs while ignoring contradictory evidence. Similarly, loss aversion causes people to fear losses more strongly than they value equivalent gains. These tendencies can distort objective judgment.\n\nExternal factors, including social influence and environmental context, also shape decisions. Studies show that individuals are more likely to adopt opinions that align with group consensus, even when contrary evidence exists. As a result, decision-making is not solely an individual process but is influenced by broader social dynamics.\n\nUnderstanding the psychological mechanisms behind decision-making has important implications for education, business, and public policy. By recognizing biases and promoting critical thinking, institutions can design strategies that encourage more rational and informed choices.`,
    qs: ['1. What is the main idea of the passage?', '2. What assumption about decision-making does the passage challenge?', '3. According to the theory mentioned, how many systems does the brain use for decisions?', '4. What characterizes the first decision-making system?', '5. Why is the analytical system used less often?', '6. What is confirmation bias?', '7. What does loss aversion describe?', '8. How can social influence affect decisions?', '9. What does the passage suggest about group consensus?', '10. Why is understanding decision-making important?', '11. What is the tone of the passage?', '12. Which factor is NOT mentioned as influencing decisions?', '13. What is one consequence of cognitive biases?', '14. What can institutions do to improve decision-making?', '15. Which statement best summarizes the author’s viewpoint?'],
    opts: [['A. Financial investments', 'B. The psychology behind decision-making', 'C. Social dynamics in groups', 'D. Educational strategies'], ['A. Decisions are always fast', 'B. Decisions are made purely through rational analysis', 'C. Emotions do not exist', 'D. People only care about losses'], ['A. One', 'B. Two', 'C. Three', 'D. Four'], ['A. Slow and deliberate', 'B. Analytical and accurate', 'C. Fast, automatic, and intuitive', 'D. Emotionless'], ['A. It is less accurate', 'B. It demands greater mental effort', 'C. It is too intuitive', 'D. It relies on biases'], ['A. Fearing losses', 'B. Adopting group opinions', 'C. Favoring information that supports existing beliefs', 'D. Making quick judgments'], ['A. Ignoring contradictions', 'B. Loving financial gains', 'C. Fearing losses more strongly than valuing equivalent gains', 'D. Making rational choices'], ['A. By eliminating biases', 'B. By increasing mental effort', 'C. Through group consensus', 'D. By avoiding environmental context'], ['A. It is irrelevant', 'B. People ignore it', 'C. Individuals are likely to adopt opinions aligning with it', 'D. It always provides contradictory evidence'], ['A. To manipulate markets', 'B. It has implications for education, business, and policy', 'C. To eliminate all emotions', 'D. To increase cognitive bias'], ['A. Emotional', 'B. Analytical and informative', 'C. Humorous', 'D. Strongly critical'], ['A. Social influence', 'B. Emotions', 'C. Weather conditions', 'D. Cognitive biases'], ['A. They improve accuracy', 'B. They distort objective judgment', 'C. They increase mental effort', 'D. They eliminate social influence'], ['A. Hide information', 'B. Promote critical thinking to encourage rational choices', 'C. Force group consensus', 'D. Ignore external factors'], ['A. Decisions are entirely logical', 'B. Decision-making is complex, influenced by systems, biases, and social factors', 'C. Emotions should be banned', 'D. Analytical thinking is useless']],
    ansLetters: ['B', 'B', 'B', 'C', 'B', 'B', 'C', 'C', 'C', 'B', 'B', 'C', 'B', 'B', 'B']
  },
  {
    title: 'The Impact of Globalization on Cultural Identity',
    text: `Globalization has transformed the way societies interact, trade, and communicate. Advances in transportation and digital technology have enabled ideas, goods, and cultural practices to cross borders with unprecedented speed. As a result, nations are more interconnected than ever before. While globalization has stimulated economic growth and innovation, it has also sparked debate regarding its influence on cultural identity.\n\nSupporters argue that globalization encourages cultural exchange and mutual understanding. Exposure to diverse traditions, cuisines, languages, and artistic expressions can enrich societies and promote tolerance. International collaboration in education and business has further strengthened cross-cultural relationships.\n\nHowever, critics contend that globalization may lead to cultural homogenization, where dominant cultures overshadow local traditions. The widespread influence of global media and multinational corporations can diminish unique customs and languages. In some cases, younger generations adopt global trends at the expense of traditional practices, raising concerns about cultural preservation.\n\nMoreover, economic inequality between nations can intensify cultural imbalance. Wealthier countries often exert greater influence over global narratives, shaping consumer preferences and social values worldwide. This imbalance may limit the ability of smaller cultures to maintain distinct identities.\n\nDespite these challenges, many scholars suggest that cultures are not static but adaptive. Rather than disappearing, local traditions often evolve by integrating global influences while retaining core characteristics. The long-term impact of globalization on cultural identity remains complex and multifaceted.`,
    qs: ['1. What is the central issue discussed in the passage?', '2. What has enabled faster global interaction?', '3. What benefit of globalization do supporters highlight?', '4. What concern do critics raise?', '5. What is meant by cultural homogenization?', '6. How can multinational corporations affect local cultures?', '7. Why are younger generations mentioned?', '8. How can economic inequality influence culture?', '9. What role do wealthier countries play in globalization?', '10. What does the passage suggest about cultural identity?', '11. What tone does the author adopt?', '12. Which factor is NOT directly mentioned as contributing to globalization?', '13. What is one potential positive outcome of cultural exchange?', '14. What does the author imply about the future of local traditions?', '15. Which statement best reflects the author’s overall viewpoint?'],
    opts: [['A. Economic recession', 'B. The effect of globalization on cultural identity', 'C. Tourism development', 'D. Transportation systems'], ['A. Agricultural reforms', 'B. Advances in transportation and digital technology', 'C. Climate change', 'D. Local markets'], ['A. Cultural isolation', 'B. Cultural exchange and understanding', 'C. Reduced trade', 'D. Language extinction'], ['A. Increased employment', 'B. Cultural homogenization', 'C. Better education', 'D. Lower prices'], ['A. The celebration of diversity', 'B. The merging of different languages', 'C. The dominance of one culture over others', 'D. The protection of traditions'], ['A. By preserving traditions', 'B. By promoting global trends over local customs', 'C. By reducing trade', 'D. By limiting communication'], ['A. They reject globalization completely', 'B. They often adopt global trends', 'C. They control multinational companies', 'D. They avoid media influence'], ['A. It strengthens small cultures only', 'B. It eliminates trade barriers', 'C. It creates cultural imbalance', 'D. It reduces media access'], ['A. They have less influence', 'B. They shape global narratives', 'C. They avoid economic growth', 'D. They reduce exports'], ['A. It is fixed and unchanging', 'B. It disappears quickly', 'C. It adapts and evolves', 'D. It is irrelevant'], ['A. Strongly critical', 'B. Completely supportive', 'C. Balanced and analytical', 'D. Emotional and biased'], ['A. Digital technology', 'B. Transportation advances', 'C. Multinational corporations', 'D. Space exploration'], ['A. Increased conflict', 'B. Greater mutual understanding', 'C. Cultural extinction', 'D. Reduced creativity'], ['A. They will vanish entirely', 'B. They will remain unchanged', 'C. They may evolve while retaining core traits', 'D. They will dominate globally'], ['A. Globalization destroys all cultures', 'B. Globalization has both positive and negative effects on identity', 'C. Cultural identity is irrelevant today', 'D. Only wealthy nations benefit culturally']],
    ansLetters: ['B', 'B', 'B', 'B', 'C', 'B', 'B', 'C', 'B', 'C', 'C', 'D', 'B', 'C', 'B']
  }
];

const formattedReadingTests = rawReadingData.map((data, index) => {
  const formattedQs = data.qs.map((qText, qIdx) => ({
    number: qIdx + 1,
    type: 'multiple_choice',
    text: qText,
    options: data.opts[qIdx],
    correctAnswer: getReadingCorrectAnswerStr(data.opts[qIdx], data.ansLetters[qIdx])
  }));
  return { title: `Academic Reading Test ${index + 1}`, sections: [{ title: data.title, passage: data.text, questions: formattedQs }] };
});

// =========================================================================
// 4. HARDCODED WRITING & SPEAKING DATA (TESTS 1-10)
// =========================================================================
const writingTests = [
  { task1: { prompt: 'Instructions: You should spend about 20 minutes on this task.\n\nLine graph showing global internet usage from 2000 to 2020. Summarize the information by selecting and reporting the main features.', minWords: 150, imageUrl: 'https://quickchart.io/chart?c={type:"line",data:{labels:[2000,2005,2010,2015,2020],datasets:[{label:"Usage %",data:[10,25,45,65,85]}]}}' }, task2: { prompt: 'Instructions: You should spend about 40 minutes on this task.\n\nSome people think that remote work improves productivity, while others believe it reduces collaboration. Discuss both views and give your opinion.', minWords: 250 } },
  { task1: { prompt: 'Instructions: You should spend about 20 minutes on this task.\n\nBar chart comparing renewable energy usage in four countries. Summarize the information by selecting and reporting the main features.', minWords: 150, imageUrl: 'https://quickchart.io/chart?c={type:"bar",data:{labels:["USA","UK","Germany","India"],datasets:[{data:[35,45,55,25]}]}}' }, task2: { prompt: 'Instructions: You should spend about 40 minutes on this task.\n\nMany universities now offer online courses. Do the advantages outweigh the disadvantages?', minWords: 250 } },
  { task1: { prompt: 'Instructions: You should spend about 20 minutes on this task.\n\nPie chart showing household expenditure distribution. Summarize the information by selecting and reporting the main features.', minWords: 150, imageUrl: 'https://quickchart.io/chart?c={type:"pie",data:{labels:["Housing","Food","Transport","Other"],datasets:[{data:[40,25,20,15]}]}}' }, task2: { prompt: 'Instructions: You should spend about 40 minutes on this task.\n\nSome people believe that governments should spend more money on public transport rather than building new roads. To what extent do you agree or disagree?', minWords: 250 } },
  { task1: { prompt: 'Instructions: You should spend about 20 minutes on this task.\n\nLine graph showing population growth in urban areas. Summarize the information by selecting and reporting the main features.', minWords: 150, imageUrl: 'https://quickchart.io/chart?c={type:"line",data:{labels:[1990,2000,2010,2020],datasets:[{label:"Population (millions)",data:[2,3.5,5,7]}]}}' }, task2: { prompt: 'Instructions: You should spend about 40 minutes on this task.\n\nSome people argue that children should start learning a foreign language at primary school. Discuss the advantages and disadvantages.', minWords: 250 } },
  { task1: { prompt: 'Instructions: You should spend about 20 minutes on this task.\n\nBar chart showing smartphone sales over five years. Summarize the information by selecting and reporting the main features.', minWords: 150, imageUrl: 'https://quickchart.io/chart?c={type:"bar",data:{labels:[2016,2017,2018,2019,2020],datasets:[{data:[50,60,75,90,110]}]}}' }, task2: { prompt: 'Instructions: You should spend about 40 minutes on this task.\n\nMany believe that technology makes people less socially active. Do you agree or disagree?', minWords: 250 } },
  { task1: { prompt: 'Instructions: You should spend about 20 minutes on this task.\n\nPie chart illustrating modes of transportation used in a city. Summarize the information by selecting and reporting the main features.', minWords: 150, imageUrl: 'https://quickchart.io/chart?c={type:"pie",data:{labels:["Car","Bus","Train","Bike"],datasets:[{data:[45,25,20,10]}]}}' }, task2: { prompt: 'Instructions: You should spend about 40 minutes on this task.\n\nSome people think that the best way to reduce crime is to give longer prison sentences. Others believe there are better methods. Discuss both views.', minWords: 250 } },
  { task1: { prompt: 'Instructions: You should spend about 20 minutes on this task.\n\nLine graph showing CO2 emissions from 2000 to 2020. Summarize the information by selecting and reporting the main features.', minWords: 150, imageUrl: 'https://quickchart.io/chart?c={type:"line",data:{labels:[2000,2005,2010,2015,2020],datasets:[{label:"CO2 (tons)",data:[5,6,7,8,9]}]}}' }, task2: { prompt: 'Instructions: You should spend about 40 minutes on this task.\n\nSome people think that governments should ban advertisements aimed at children. To what extent do you agree or disagree?', minWords: 250 } },
  { task1: { prompt: 'Instructions: You should spend about 20 minutes on this task.\n\nBar chart comparing employment rates in different sectors. Summarize the information by selecting and reporting the main features.', minWords: 150, imageUrl: 'https://quickchart.io/chart?c={type:"bar",data:{labels:["Tech","Healthcare","Education","Manufacturing"],datasets:[{data:[70,60,50,40]}]}}' }, task2: { prompt: 'Instructions: You should spend about 40 minutes on this task.\n\nMany people prefer to buy international products rather than local ones. Why is this the case? Is it a positive or negative development?', minWords: 250 } },
  { task1: { prompt: 'Instructions: You should spend about 20 minutes on this task.\n\nPie chart showing sources of energy production. Summarize the information by selecting and reporting the main features.', minWords: 150, imageUrl: 'https://quickchart.io/chart?c={type:"pie",data:{labels:["Coal","Solar","Wind","Hydro"],datasets:[{data:[40,20,25,15]}]}}' }, task2: { prompt: 'Instructions: You should spend about 40 minutes on this task.\n\nSome believe that students should take a gap year before entering university. Discuss the advantages and disadvantages.', minWords: 250 } },
  { task1: { prompt: 'Instructions: You should spend about 20 minutes on this task.\n\nLine graph comparing online shopping growth. Summarize the information by selecting and reporting the main features.', minWords: 150, imageUrl: 'https://quickchart.io/chart?c={type:"line",data:{labels:[2015,2016,2017,2018,2019,2020],datasets:[{label:"Online Sales",data:[20,30,45,60,80,100]}]}}' }, task2: { prompt: 'Instructions: You should spend about 40 minutes on this task.\n\nSome people believe that environmental problems are too big for individuals to solve. Others think individuals can make a difference. Discuss both views and give your opinion.', minWords: 250 } }
];

const speakingTests = [
  { part1: { questions: ['Can you tell me about your hometown?', 'How has your hometown changed in recent years?', 'What kind of accommodation do you live in?', 'Do you prefer living in a house or an apartment? Why?'] }, part2: { cueCard: 'Describe a skill you learned that was difficult.\nYou should say:\n- What the skill was\n- Why you decided to learn it\n- What challenges you faced\n- And explain how you felt after learning it.' }, part3: { questions: ['Why do some people give up easily when learning new skills?', 'How important is persistence in achieving success?', 'Should schools focus more on practical skills or academic knowledge?'] } },
  { part1: { questions: ['Do you work or study?', 'Why did you choose this field?', 'What do you enjoy most about your daily routine?', 'Do you prefer working alone or in a team?'] }, part2: { cueCard: 'Describe a person who has influenced your career choices.\nYou should say:\n- Who the person is\n- How you know them\n- What influence they had\n- And explain why their influence was important.' }, part3: { questions: ['How do role models shape young people’s ambitions?', 'Is formal education necessary for career success?', 'How might career choices change in the future?'] } },
  { part1: { questions: ['Do you enjoy spending time outdoors?', 'What outdoor activities are popular in your country?', 'How often do you exercise?', 'What motivates people to stay physically active?'] }, part2: { cueCard: 'Describe a healthy habit you developed.\nYou should say:\n- What the habit is\n- When you started it\n- Why you decided to start\n- And explain how it has benefited you.' }, part3: { questions: ['Why are lifestyle diseases increasing nowadays?', 'Should governments invest more in public health campaigns?', 'How can schools encourage healthier lifestyles?'] } },
  { part1: { questions: ['Do you enjoy using technology?', 'How often do you use social media?', 'Has technology changed how you communicate?', 'Do you think technology makes life easier?'] }, part2: { cueCard: 'Describe a piece of technology you find useful.\nYou should say:\n- What it is\n- How you use it\n- When you started using it\n- And explain why it is important to you.' }, part3: { questions: ['What are the disadvantages of relying too much on technology?', 'Will artificial intelligence replace many jobs?', 'How should people prepare for technological changes?'] } },
  { part1: { questions: ['Do you enjoy travelling?', 'What type of places do you prefer visiting?', 'How do you usually plan your trips?', 'Has travel become easier compared to the past?'] }, part2: { cueCard: 'Describe a place you would like to visit in the future.\nYou should say:\n- Where it is\n- What you know about it\n- Who you would go with\n- And explain why you want to visit it.' }, part3: { questions: ['How does tourism impact the environment?', 'Should governments limit the number of tourists in some areas?', 'How might travel change in the next 20 years?'] } },
  { part1: { questions: ['Do you enjoy watching films?', 'What type of films are popular in your country?', 'Do you prefer watching films at home or in the cinema?', 'Has your taste in films changed over time?'] }, part2: { cueCard: 'Describe a film that left a strong impression on you.\nYou should say:\n- What the film was about\n- When you watched it\n- Why you remember it\n- And explain how it influenced you.' }, part3: { questions: ['How do films influence society?', 'Should films be used as educational tools?', 'Do you think traditional cinema will survive in the future?'] } },
  { part1: { questions: ['Do you enjoy shopping?', 'Do you prefer online or in-store shopping?', 'What factors influence your buying decisions?', 'Has consumer behavior changed in recent years?'] }, part2: { cueCard: 'Describe a purchase you regretted.\nYou should say:\n- What you bought\n- Why you bought it\n- Why you regretted it\n- And explain what you learned from the experience.' }, part3: { questions: ['Why do people make impulsive purchases?', 'How does advertising affect consumer choices?', 'Should financial education be compulsory in schools?'] } },
  { part1: { questions: ['Do you like reading books?', 'What kind of books do you prefer?', 'How often do you read?', 'Do you think reading habits are changing?'] }, part2: { cueCard: 'Describe a book that influenced your thinking.\nYou should say:\n- What the book was\n- When you read it\n- What it was about\n- And explain how it affected you.' }, part3: { questions: ['Why do some people lose interest in reading?', 'Are digital books replacing printed books?', 'How can parents encourage children to read more?'] } },
  { part1: { questions: ['Do you enjoy learning new languages?', 'How did you learn English?', 'Is it important to learn foreign languages?', 'What challenges do language learners face?'] }, part2: { cueCard: 'Describe a time you struggled to communicate.\nYou should say:\n- Where it happened\n- Who you were speaking with\n- What the difficulty was\n- And explain how you handled the situation.' }, part3: { questions: ['Why is communication important in professional life?', 'How has technology changed communication?', 'Will translation technology remove the need to learn languages?'] } },
  { part1: { questions: ['Do you enjoy teamwork?', 'Have you ever led a team?', 'What qualities make a good leader?', 'Do you prefer being a leader or a team member?'] }, part2: { cueCard: 'Describe a time you worked successfully in a team.\nYou should say:\n- What the task was\n- Who was in the team\n- What your role was\n- And explain why the teamwork was successful.' }, part3: { questions: ['Why do some teams fail despite having talented members?', 'How can leadership styles affect team performance?', 'Will teamwork become more important in the future workplace?'] } }
];

// =========================================================================
// 🚀 DATABASE SEEDER LOGIC (COMBINING OLD DYNAMIC 20 + NEW HARDCODED 10)
// =========================================================================

async function seed() {
  await mongoose.connect(MONGODB_URI, { dbName: 'IELTS_PREPERATION_PLATFORM' });
  console.log('Connected to MongoDB. Wiping old collections completely...');

  try { await ReadingTest.collection.drop(); } catch(e){}
  try { await ListeningTest.collection.drop(); } catch(e){}
  try { await WritingTest.collection.drop(); } catch(e){}
  try { await SpeakingTest.collection.drop(); } catch(e){}

  const listeningSources = [
    { context: 'Library Registration', url: '/Librarian audio.mp3', qs: libraryQuestions },
    { context: 'Biology Lecture', url: '/Lecture audio.mp3', qs: lectureQuestions },
    { context: 'Research Meeting', url: '/Research project.mp3', qs: researchQuestions },
    { context: 'Museum Tour', url: '/museum audio.mp3', qs: museumQuestions },
    { context: 'Health Clinic', url: '/health_clinic.mp3.mpeg', qs: clinicQuestions },
    { context: 'Wildlife Park', url: '/wildlife_park.mp3.mpeg', qs: wildlifeQuestions },
    { context: 'Gym Membership', url: '/gym_audio.mp3.mpeg', qs: gymQuestions },
    { context: 'Community Sports Center', url: '/Community Sports Center.mp3.mpeg', qs: brainQuestions }
  ];

  const readingDocs = [];
  const listeningDocs = [];
  const writingDocs = [];
  const speakingDocs = [];

  console.log('Generating Tests 1-10 (Hardcoded Specific Content)...');
  
  for (let i = 0; i < 10; i++) {
    // === 🚨 THE FIX IS ON THIS NEXT LINE 🚨 ===
    // Added modulo (% formattedReadingTests.length) so it doesn't crash when i >= 5
    let rTest = JSON.parse(JSON.stringify(formattedReadingTests[i % formattedReadingTests.length]));
    rTest.title = `Full Academic Mock Test ${i + 1}`;
    readingDocs.push(rTest);

    // 2. LISTENING (1-10)
    let lSource = listeningSources[i % listeningSources.length];
    listeningDocs.push({
      title: `Full Academic Mock Test ${i + 1} - ${lSource.context}`,
      sections: [{ audioUrl: lSource.url, questions: lSource.qs }]
    });

    // 3. WRITING (1-10)
    let wTest = JSON.parse(JSON.stringify(writingTests[i % writingTests.length]));
    wTest.title = `Full Academic Mock Test ${i + 1}`; 
    writingDocs.push(wTest);

    // 4. SPEAKING (1-10)
    let sTest = JSON.parse(JSON.stringify(speakingTests[i % speakingTests.length]));
    sTest.title = `Full Academic Mock Test ${i + 1}`;
    speakingDocs.push(sTest);
  }

  console.log('Generating Tests 11-30 (Dynamic Thematic Content)...');
  
  for (let i = 10; i < 30; i++) {
    const topic = allTopics[i - 10]; // Cycle through the 20 old topics
    
    // 1. DYNAMIC READING
    readingDocs.push({
      title: `Targeted Reading Practice ${i + 1}: ${topic}`,
      sections: [{
        title: `Passage 1: A Deep Dive into ${topic}`,
        passage: `<p>This comprehensive academic text investigates the fascinating domain of <b>${topic}</b>. Over the last century, scholars have thoroughly debated the foundational mechanisms of this field. Initial theories suggested that early progress was purely accidental, but recent archaeological and data-driven discoveries indicate a highly structured approach by our ancestors.</p><br/><p>As we move into the modern era, the implications of ${topic} are becoming exponentially more critical to global sustainability and scientific progress. The next decade will likely see an unprecedented surge in related funding and research, drastically changing how local governments respond to economic pressures.</p>`,
        questions: getReadingQs(topic)
      }]
    });
    
    // 2. LISTENING
    let lSource = listeningSources[i % listeningSources.length];
    listeningDocs.push({
      title: `Targeted Listening Practice ${i + 1} - ${lSource.context}`,
      sections: [{ audioUrl: lSource.url, questions: lSource.qs }]
    });

    // 3. DYNAMIC WRITING
    const chartConfig = { type: 'bar', data: { labels: ['2010', '2015', '2020'], datasets: [{ label: 'Data', data: [Math.floor(Math.random()*100), Math.floor(Math.random()*100), Math.floor(Math.random()*100)] }] }};
    writingDocs.push({
      title: `Targeted Writing Practice ${i + 1}: ${topic}`,
      task1: { prompt: `Instructions: You should spend about 20 minutes on this task.\n\nThe chart below shows the changes in ${topic} across two countries between 2010 and 2020.\nSummarize the information by selecting and reporting the main features, and make comparisons where relevant.`, minWords: 150, imageUrl: `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=500&h=300` },
      task2: { prompt: `Instructions: You should spend about 40 minutes on this task.\n\nMany people argue that issues surrounding ${topic.toLowerCase()} are the most urgent of our time. To what extent do you agree?\n\nGive reasons for your answer and include relevant examples.`, minWords: 250 }
    });

    // 4. DYNAMIC SPEAKING
    speakingDocs.push({
      title: `Targeted Speaking Practice ${i + 1}: ${topic}`,
      part1: { questions: [`Let's talk about ${topic}.`, `Do you generally enjoy learning about ${topic}?`, `How has your view on ${topic} changed recently?`] },
      part2: { cueCard: `Describe a memorable experience you had relating to ${topic}.\n\nYou should say:\n- What happened\n- When and where it happened\n- Who you were with\n\nAnd explain why it was memorable.` },
      part3: { questions: [`What is the broader impact of ${topic} on society today?`, `How do you think ${topic} will evolve in 50 years?`] }
    });
  }

  // Insert all to DB
  await ReadingTest.insertMany(readingDocs);
  await ListeningTest.insertMany(listeningDocs);
  await WritingTest.insertMany(writingDocs);
  await SpeakingTest.insertMany(speakingDocs);

  console.log('✅ Seed complete! ALL 30 TESTS HAVE BEEN GENERATED!');
  console.log('✅ Tests 1-10: Hardcoded Specific Content.');
  console.log('✅ Tests 11-30: Dynamic Content based on 20 Topics.');
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});