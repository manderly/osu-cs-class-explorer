/* eslint-disable max-len */
export const summaries = {
  CS161: { description: 'Overview of fundamental concepts of computer science. Introduction to problem solving, software engineering, and object-oriented programming. Includes algorithm design and program development. Students write small programs in C++.',
            proctoredTests: 'Yes',
            book: 'Starting Out with C++: Early Objects (9th edition)',
            bookLink: 'http://amzn.to/2hz4mOi',
            prereqs: 'None',
            groupWork: 'None'
          },
  CS162: { description: 'Introduces data structures, algorithms, and requires students to produce weekly labs and larger bi-weekly projects in C++.',
            proctoredTests: 'No',
            book: 'Starting Out with C++: Early Objects (9th edition)',
            bookLink: 'http://amzn.to/2hz4mOi',
            prereqs: 'CS161',
            groupWork: 'One group project halfway through the quarter where a team of about 5 students implements a given program in C++'
          },
  CS165: { description: 'Condenses CS161 and CS162 into one fast-paced course.',
            proctoredTests: 'Yes',
            book: 'Starting Out with C++: Early Objects (9th edition)',
            bookLink: 'http://amzn.to/2hz4mOi',
            prereqs: 'None',
            groupWork: 'Two small group projects in which you compare your work on a previous assignment and decide whose was best and explain why.'
          },
  CS225: { description: 'An introduction to the discrete mathematics of computer science, including logic, set and set operations, methods of proof, recursive definitions, combinatorics, and graph theory.',
            proctoredTests: 'Yes',
            book: 'Discrete Mathematics with Applications (4th edition)',
            bookLink: 'http://amzn.to/2zsLFXh',
            prereqs: 'None',
            groupWork: 'None'
           },
  CS261: { description: 'Teaches abstract data types, dynamic arrays, linked lists, trees and graphs, binary search trees, hash tables, storage management, complexity analysis of data structures. Classwork is done in C (not C++).',
            proctoredTests: 'Yes',
            book: 'C Programming Language (2nd edition)',
            bookLink: 'http://amzn.to/2zssgpd',
            bookOptional: 'Optional',
            prereqs: 'CS162 or CS165 and CS225',
            groupWork: 'Weekly worksheets to complete and discuss in a small group. Must submit typed "meeting minutes" to Piazza each week.'
          },
  CS271: { description: 'Introduction to functional organization and operation of digital computers. Coverage of assembly language; addressing, stacks, argument passing, arithmetic operations, decisions, macros, modularization, linkers and debuggers.',
            proctoredTests: 'Yes',
            book: 'Assembly Language for x86 Processors (7th edition)',
            bookLink: 'http://amzn.to/2h6HqbY',
            prereqs: 'CS161 or CS165',
            groupWork: 'None'
          },
  CS290: { description: 'How to design and implement a multi-tier application using web technologies: creation of extensive custom client- and server-side code, consistent with achieving a high-quality software architecture.',
            proctoredTests: 'Yes',
            book: 'Eloquent JavaScript, 2nd Ed.: A Modern Introduction to Programming (2nd edition)',
            bookLink: 'http://amzn.to/2h7GNyV',
            prereqs: 'CS162 or CS165',
            groupWork: 'None'
          },
  CS325: { description: 'Recurrence relations, combinatorics, recursive algorithms, proofs of correctness.',
            proctoredTests: 'Yes',
            book: 'Introduction to Algorithms, 3rd Edition (MIT Press)',
            bookLink: 'http://amzn.to/2A9ODwF',
            prereqs: 'CS261 and CS225',
            groupWork: 'Graded weekly Canvas discussions in a small group and a 3-person group project the last two weeks of the quarter. Students can choose their group mates for the final project or elect to be placed in a random group.'
          },
  CS340: { description: 'Design and implementation of relational databases, including data modeling with ER or UML, diagrams, relational schema, SQL queries, relational algebra, user interfaces, and administration.',
            proctoredTests: 'Yes',
            book: '',
            bookLink: '',
            prereqs: 'CS290',
            groupWork: 'Final project is fairly involved and allows you to choose a partner (optional)'
          },
  CS344: { description: 'Introduction to operating systems using UNIX as the case study. System calls and utilities, fundamentals of processes and interprocess communication.',
            proctoredTests: 'No',
            book: '',
            bookLink: '',
            prereqs: 'CS261 and CS271',
            groupWork: 'None'
          },
  CS352: { description: 'Basic principles of usability engineering methods for the design and evaluation of software systems. Includes the study of human-machine interactions, user interface characteristics and design strategies, software evaluation methods, and related guidelines and standards.',
            proctoredTests: 'No midterm, proctored final',
            book: 'Interaction Design: Beyond Human-Computer Interaction (4th edition)',
            bookLink: 'http://amzn.to/2xPRg5a',
            prereqs: 'CS161 or CS165',
            groupWork: 'The whole class is a group project where you work in groups of 4 to complete weekly writing and UI mockup assignments.'
          },
  CS361: { description: 'Introduction to the \'front end\' of the software engineering lifecycle; requirements analysis and specification; design techniques; project management.',
            proctoredTests: 'Yes',
            book: '',
            bookLink: '',
            prereqs: 'CS261',
            groupWork: 'Almost exclusively group work. Work in a team of 5 to prepare weekly written reports about the software development lifecycle.'
          },
  CS362: { description: 'Introduction to the \'back end\' of the software engineering lifecycle implementation; verification and validation; debugging; maintenance.',
            proctoredTests: 'No',
            book: '',
            bookLink: '',
            prereqs: 'CS261',
            groupWork: 'Two group assignments and you can form your own groups.'
          },
  CS372: { description: 'Computer network principles, fundamental networking concepts, packet-switching and circuit switching, TCP/IP protocol layers, reliable data transfer, congestion control, flow control, packet forwarding and routing, MAC addressing, multiple access techniques.',
            proctoredTests: 'No',
            book: 'Computer Networking: A Top-Down Approach (7th edition)',
            bookLink: 'http://amzn.to/2xPcOyR',
            prereqs: 'CS261 and CS271',
            groupWork: 'None'
          },
  CS373: { description: 'Introduction to the current state of the art in anti-malware, computer forensics, and networking, messaging, and web security. Broad introduction to the field of computer security. Only available in winter quarters.',
            proctoredTests: 'No',
            book: '',
            bookLink: '',
            prereqs: 'CS344 and CS340 and CS372',
            groupWork: 'None'
          },
  CS391: { description: 'In-depth exploration of the social, psychological, political, and ethical issues surrounding the computer industry and the evolving information society.',
            proctoredTests: 'No',
            book: '',
            bookLink: '',
            prereqs: '',
            groupWork: 'Unknown'
          },
  CS464: { description: 'Provides a theoretical foundation of the history, key concepts, technologies, and practices associated with modern Free and Open Source Software (FOSS) projects, and gives students an opportunity to explore and make contributions to FOSS projects with some mentoring and guidance.',
            proctoredTests: 'Yes',
            bookLink: '',
            prereqs: 'CS261 or CS361',
            groupWork: 'Mandatory discussions and a few peer-reviews where you critique other students\' posts'
          },
  CS467: { description: 'Taken the last quarter before graduation. This course offers real-world team-based experience with the software engineering design and delivery cycle, including requirements analysis and specification, design techniques, and requirements and final project written documentation. In a group of 3, students spend the quarter creating a single project. (Formerly CS419) ',
            proctoredTests: 'No',
            book: '',
            bookLink: '',
            prereqs: 'CS344, CS361, and CS362',
            groupWork: 'This entire course is a group project'
          },
  CS475: { description: 'Theoretical and practical survey of parallel programming, including a discussion of parallel architectures, parallel programming paradigms, and parallel algorithms. Programming one or more parallel computers in a higher-level parallel language.',
            proctoredTests: 'Yes',
            book: '',
            bookLink: '',
            prereqs: 'CS261',
            groupWork: 'None'
          },
  CS496: { description: 'Introduction to the concepts and techniques for developing mobile and cloud applications.',
            proctoredTests: 'No',
            book: '',
            bookLink: '',
            prereqs: 'CS344',
            groupWork: 'None'
          }
};
/* eslint-enable max-len */
