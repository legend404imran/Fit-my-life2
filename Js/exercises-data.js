/* =========================================================
   EXERCISE LIBRARY — built-in database
   ========================================================= */
const EXERCISE_DB = [
  // CHEST
  { name:'Barbell Bench Press', muscle:'Chest', equipment:'Barbell', difficulty:'Intermediate', instructions:'Lie on a flat bench, grip the bar slightly wider than shoulder-width, lower to mid-chest, press up until arms are extended.', tip:'Keep shoulder blades pinched back throughout the lift.' },
  { name:'Incline Dumbbell Press', muscle:'Chest', equipment:'Dumbbell', difficulty:'Intermediate', instructions:'Set bench to 30-45°, press dumbbells up from shoulder level until arms extend, lower under control.', tip:'Avoid flaring elbows past 75° to protect the shoulders.' },
  { name:'Push-Up', muscle:'Chest', equipment:'Bodyweight', difficulty:'Beginner', instructions:'Hands under shoulders, body in a straight line, lower chest to floor, push back up.', tip:'Squeeze glutes to keep hips from sagging.' },
  { name:'Cable Fly', muscle:'Chest', equipment:'Cable', difficulty:'Intermediate', instructions:'Stand between cable towers, arms slightly bent, bring handles together in front of chest.', tip:'Focus on squeezing the chest at the peak, not pulling with shoulders.' },
  { name:'Dips', muscle:'Chest', equipment:'Bodyweight', difficulty:'Advanced', instructions:'Support body on parallel bars, lower until shoulders are below elbows, press back up.', tip:'Lean forward slightly to bias the chest over triceps.' },

  // BACK
  { name:'Deadlift', muscle:'Back', equipment:'Barbell', difficulty:'Advanced', instructions:'Feet hip-width, grip bar outside legs, drive through heels keeping back flat until standing tall.', tip:'Keep the bar close to your shins the entire pull.' },
  { name:'Pull-Up', muscle:'Back', equipment:'Bodyweight', difficulty:'Advanced', instructions:'Hang from bar with overhand grip, pull chin above bar, lower with control.', tip:'Initiate the pull by driving elbows down, not just arms.' },
  { name:'Bent-Over Barbell Row', muscle:'Back', equipment:'Barbell', difficulty:'Intermediate', instructions:'Hinge at hips to 45°, pull bar to lower ribs, squeeze shoulder blades, lower slowly.', tip:'Keep neck neutral, avoid looking up.' },
  { name:'Lat Pulldown', muscle:'Back', equipment:'Cable', difficulty:'Beginner', instructions:'Grip bar wide, pull down to upper chest while leaning back slightly, control the return.', tip:'Avoid using body momentum to pull the weight down.' },
  { name:'Seated Cable Row', muscle:'Back', equipment:'Cable', difficulty:'Beginner', instructions:'Sit with knees slightly bent, pull handle to torso, squeeze back, extend arms fully on return.', tip:'Keep chest tall rather than rounding forward.' },

  // LEGS
  { name:'Barbell Back Squat', muscle:'Legs', equipment:'Barbell', difficulty:'Advanced', instructions:'Bar on upper traps, feet shoulder-width, squat until thighs are parallel, drive up through heels.', tip:'Keep knees tracking over toes, chest up.' },
  { name:'Romanian Deadlift', muscle:'Legs', equipment:'Barbell', difficulty:'Intermediate', instructions:'Slight knee bend, hinge at hips lowering bar along legs, feel hamstring stretch, return to standing.', tip:'Keep the bar close to your body throughout.' },
  { name:'Leg Press', muscle:'Legs', equipment:'Machine', difficulty:'Beginner', instructions:'Feet shoulder-width on platform, lower until knees reach 90°, press back up without locking knees.', tip:'Do not let lower back round off the pad.' },
  { name:'Walking Lunge', muscle:'Legs', equipment:'Dumbbell', difficulty:'Intermediate', instructions:'Step forward into a lunge, back knee near floor, push through front heel to step into next lunge.', tip:'Keep torso upright rather than leaning forward.' },
  { name:'Calf Raise', muscle:'Legs', equipment:'Machine', difficulty:'Beginner', instructions:'Stand on platform edge, lower heels below platform, rise onto toes as high as possible.', tip:'Pause briefly at the top for a stronger contraction.' },

  // SHOULDERS
  { name:'Overhead Press', muscle:'Shoulders', equipment:'Barbell', difficulty:'Intermediate', instructions:'Bar at shoulder height, press overhead until arms lock out, lower under control.', tip:'Brace your core to avoid arching the lower back.' },
  { name:'Lateral Raise', muscle:'Shoulders', equipment:'Dumbbell', difficulty:'Beginner', instructions:'Arms at sides holding dumbbells, raise out to shoulder height, lower slowly.', tip:'Lead with elbows, keep a slight bend throughout.' },
  { name:'Face Pull', muscle:'Shoulders', equipment:'Cable', difficulty:'Beginner', instructions:'Pull rope towards face at eye level, elbows high, squeeze rear delts at the end.', tip:'Great for posture — keep reps controlled, not rushed.' },
  { name:'Arnold Press', muscle:'Shoulders', equipment:'Dumbbell', difficulty:'Intermediate', instructions:'Start with palms facing you, rotate and press overhead as arms extend.', tip:'Move slowly through the rotation to protect the shoulder joint.' },

  // ARMS
  { name:'Barbell Curl', muscle:'Biceps', equipment:'Barbell', difficulty:'Beginner', instructions:'Grip bar shoulder-width, curl up keeping elbows pinned, lower with control.', tip:'Avoid swinging the torso to lift heavier weight.' },
  { name:'Hammer Curl', muscle:'Biceps', equipment:'Dumbbell', difficulty:'Beginner', instructions:'Hold dumbbells neutral grip, curl straight up, lower slowly.', tip:'Keeps tension on the brachialis for thicker-looking arms.' },
  { name:'Tricep Pushdown', muscle:'Triceps', equipment:'Cable', difficulty:'Beginner', instructions:'Elbows pinned to sides, push bar down until arms extend, control the return.', tip:'Only the forearm should move — keep upper arm still.' },
  { name:'Skull Crusher', muscle:'Triceps', equipment:'Barbell', difficulty:'Intermediate', instructions:'Lying on bench, lower bar to forehead by bending elbows, extend back up.', tip:'Keep elbows pointed at the ceiling, not flared out.' },
  { name:'Wrist Curl', muscle:'Forearms', equipment:'Dumbbell', difficulty:'Beginner', instructions:'Forearms on bench, palms up, curl weight up using only the wrist.', tip:'Use light weight — this is a small muscle group.' },

  // ABS
  { name:'Plank', muscle:'Abs', equipment:'Bodyweight', difficulty:'Beginner', instructions:'Forearms and toes on floor, body in a straight line, hold the position.', tip:'Squeeze glutes and brace abs to prevent hips from sagging.' },
  { name:'Hanging Leg Raise', muscle:'Abs', equipment:'Bodyweight', difficulty:'Advanced', instructions:'Hang from a bar, raise legs to hip height or higher, lower with control.', tip:'Avoid swinging — control the negative portion.' },
  { name:'Cable Crunch', muscle:'Abs', equipment:'Cable', difficulty:'Intermediate', instructions:'Kneel below cable, rope behind neck, crunch down curling spine, return slowly.', tip:'Move from the spine, not the hips.' },
  { name:'Russian Twist', muscle:'Abs', equipment:'Bodyweight', difficulty:'Beginner', instructions:'Sit with knees bent, lean back slightly, rotate torso side to side.', tip:'Add a weight plate for extra resistance once comfortable.' },

  // CARDIO
  { name:'Running', muscle:'Cardio', equipment:'None', difficulty:'Beginner', instructions:'Maintain steady pace and breathing, land mid-foot, keep posture tall.', tip:'Increase distance gradually — no more than 10% per week.' },
  { name:'Cycling', muscle:'Cardio', equipment:'Bike', difficulty:'Beginner', instructions:'Maintain steady cadence, adjust resistance for target intensity.', tip:'Keep a slight bend in the knee at full extension for saddle height.' },
  { name:'Jump Rope', muscle:'Cardio', equipment:'Rope', difficulty:'Intermediate', instructions:'Small jumps on balls of feet, wrists rotate the rope, stay relaxed.', tip:'Start with short intervals to build rhythm before going continuous.' },
  { name:'Rowing Machine', muscle:'Cardio', equipment:'Machine', difficulty:'Intermediate', instructions:'Drive with legs first, then lean back, then pull arms — reverse the order on the return.', tip:'Legs contribute most of the power — don\'t just pull with arms.' },
];

function getMuscleGroups() {
  return [...new Set(EXERCISE_DB.map(e => e.muscle))];
}
