
const wordPairs = [
  // 3 letter words
  ['cat', 'dog'], // cat -> cot -> dog
  ['hot', 'ice'], // hot -> hit -> ice
  ['sad', 'joy'], // sad -> mad -> may -> joy
  ['bad', 'win'], // bad -> bid -> win
  ['raw', 'fit'], // raw -> rat -> fat -> fit
  ['dry', 'wet'], // dry -> day -> way -> wet

  // 4 letter words
  ['cold', 'warm'], // cold -> cord -> card -> ward -> warm
  ['dark', 'glow'], // dark -> dare -> gore -> glow
  ['hate', 'love'], // hate -> have -> hove -> love
  ['poor', 'rich'], // poor -> pour -> your -> year -> rich
  ['slow', 'fast'], // slow -> show -> shot -> fast
  ['soft', 'hard'], // soft -> sort -> hart -> hard
  ['dust', 'wash'], // dust -> rust -> rush -> wash
  ['deer', 'wolf'], // deer -> dear -> wear -> wolf
  ['fire', 'cool'], // fire -> fine -> cone -> cool
  ['lose', 'gain'], // lose -> lost -> last -> gain
  ['pain', 'heal'], // pain -> rain -> rail -> heal
  ['weak', 'bold'], // weak -> beak -> bear -> bold
  ['bird', 'fish'], // bird -> bind -> find -> fish
  ['moon', 'star'], // moon -> moan -> soar -> star
  ['wind', 'calm'], // wind -> wine -> wane -> calm
  ['seed', 'tree'], // seed -> send -> tent -> tree
  ['wild', 'tame'], // wild -> wind -> wine -> tame
  ['rain', 'snow'], // rain -> ruin -> rule -> snow
  ['hide', 'seek'], // hide -> hire -> here -> seek
  ['near', 'away'], // near -> wear -> weak -> away
  ['dawn', 'dusk'], // dawn -> down -> dock -> duck -> dusk
  ['calm', 'rage'], // calm -> call -> rail -> rage
  ['glad', 'blue'], // glad -> gland -> bland -> blue
  ['warm', 'cool'], // warm -> ward -> word -> wood -> cool
  ['walk', 'jump'], // walk -> wall -> will -> till -> jump
  ['rise', 'fall'], // rise -> risk -> task -> fall
  ['push', 'pull'], // push -> puss -> pass -> pall -> pull
  ['blue', 'pink'], // blue -> blur -> plus -> pink
  ['gold', 'gray'], // gold -> grid -> grin -> gray
  ['ruby', 'jade'], // ruby -> rubs -> jabs -> jade
  ['mind', 'body'], // mind -> mint -> mist -> most -> body
  ['fact', 'myth'], // fact -> face -> fame -> mime -> myth
  ['real', 'fake'], // real -> reel -> feel -> feet -> fake
  ['true', 'lies'], // true -> tree -> free -> flee -> lies
  ['past', 'next'], // past -> pass -> bass -> base -> next

  // 5 letter words
  ['sleep', 'awake'], // sleep -> sweep -> sweat -> await -> awake
  ['smile', 'laugh'], // smile -> smite -> spite -> spite -> laugh
  ['grass', 'bloom'], // grass -> brass -> brain -> bloom
  ['earth', 'space'], // earth -> heart -> heard -> space
  ['drink', 'water'], // drink -> drank -> crank -> water
  ['break', 'whole'], // break -> bread -> braid -> while -> whole
  ['sharp', 'blunt'], // sharp -> shard -> shade -> blade -> blunt
  ['fresh', 'stale'], // fresh -> flesh -> flash -> stash -> stale
  ['beach', 'water'], // beach -> bench -> watch -> water
  ['cloud', 'storm'], // cloud -> clout -> stout -> storm
  ['rough', 'clear'], // rough -> rouge -> range -> crane -> clear
  ['movie', 'radio'], // movie -> moved -> roved -> radio
  ['dream', 'sleep'], // dream -> cream -> creak -> speak -> sleep
  ['happy', 'angry'], // happy -> harpy -> hasty -> nasty -> angry
  ['sweet', 'salty'], // sweet -> sweat -> sheat -> shaft -> salty
  ['light', 'shade'], // light -> night -> eight -> sight -> shade
  ['plant', 'bloom'], // plant -> plane -> blame -> bloom
  ['quick', 'still'], // quick -> thick -> think -> stink -> still
  ['begin', 'ended'], // begin -> begin -> being -> bring -> ended
  ['sunny', 'rainy'], // sunny -> funny -> funky -> randy -> rainy
  ['frost', 'bloom'], // frost -> front -> frond -> broad -> bloom
  ['shore', 'ocean'], // shore -> share -> shake -> shave -> ocean
  ['river', 'ocean'], // river -> riven -> raven -> ocean
  ['grass', 'trees'], // grass -> grabs -> crabs -> crees -> trees
  ['cloud', 'clear'], // cloud -> clout -> float -> fleat -> clear
  ['early', 'later'], // early -> earls -> tears -> later
  ['today', 'never'], // today -> toady -> ready -> never
  ['brave', 'timid'], // brave -> brake -> break -> timid
  ['storm', 'peace'], // storm -> store -> stare -> space -> peace
];

export default wordPairs;