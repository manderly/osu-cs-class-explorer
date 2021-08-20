# OSU CS Course Explorer

Wondering how hard your next class might be? Did other students think CS162 was a bloodbath, too? This app can tell you!

The [OSU eCampus subreddit](https://www.reddit.com/r/OSUOnlineCS/) collects course reviews from real students into [this spreadsheet](https://docs.google.com/spreadsheets/d/1MFBGJbOXVjtThgj5b6K0rv9xdsC1M2GQ0pJVB-8YCeU/edit#gid=2042942971), but the spreadsheet is large and hard to navigate. This app lets you view individual course reviews and aggregates difficulty ratings and time spent.

This project was generated with the [Angular Full-Stack Generator](https://github.com/DaftMonk/generator-angular-fullstack) version 4.2.2.


![OSU Course Explorer - March 2018](screenshots/osu-cs-course-explorer.com_march_2018.png "Screenshot of app taken March 2018")

# Development

## Prerequisites

- [Git](https://git-scm.com/)
- [Node.js and npm](nodejs.org) Node >= 15.x.x, npm >= 2.x.x
- [Gulp](http://gulpjs.com/) (`npm install --global gulp-cli`)

## Building & Running

Run `npm install` to install server dependencies.

For setup on a new machine:

```gulp build```

```cd dist```

```git init```

```heroku git:remote -a <your-project>```

```gulp buildcontrol:heroku```

For subsequent runs:

Run `gulp build` for building and `gulp serve` for preview on localhost:3000.

Run `gulp buildcontrol:heroku` to deploy to Heroku.

## Testing

Run `npm test` to run the unit tests with karma.

# Change log

**August 2021**
- Updated to latest google-spreadsheets node package to keep up with current Google Spreadsheets API version
- There are now 1212 course reviews!

**May 2021**
- Maintenance: Modernized node, updated packages, added a Google ad (sorry, this app costs money to run)

**March 2018** 
- New feature: "Common pairings", a new chart displaying the courses most frequently paired with a particular course as per the student-reported data
- New feature: "Group work", a short section describing the course's amount and type of group work (if any)
- Major bug fix: app now includes course reviews that co-exist on the same line in the spreadsheet. Switched to [Google Spreadsheet](https://www.npmjs.com/package/google-spreadsheet) package and improved the way rows are parsed. App now displays 658 reviews. 

**November 2017** 
- App goes live with 330+ course reviews.

Thank you, everyone, for your feedback and interest in the Course Explorer!

&copy; 2021 Mandi Burley
