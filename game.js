var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update});

function gamepadSetup()
{
	players[0].gamepadType = 'dualShock2';
}


//Constants

var PLAYER_NUMBER = 1;

var PAD_LIMITER = 0.5;

var JUMPHEIGHT = 15;
var MOVESPEED = 2000;
var FRICTION = 20;

var PLAYER_GRAVITY = 800;

//initializers

var cursors;

var players = new Array();

var pad1;
var pad2;
var platform;

var emitter;

// ----------------------------------------------------------------------HELIX ROCKET TEST
var weapon;

function Player()
{
	var number;
	var sprite;
	var arms;
	var pad;
	var jump = 0;
	var gamepadType;
	var weapon;

	var hero;

}//player

function Heroes(name, code)
{
	var list = 
	[
	'soldier76'
	];

	var LIST_SIZE = 1;

	var selected = -1;

	for(var i = 0; i < LIST_SIZE; i++)
	{
		if(i === name)
			selected = i;
	}

	//hero sets:
	/*
	[
		player body image, player arms image
		weapon image,


	]
	*/

	var soldier76 = 
	[
	];

	switch(i)
	{
		case(0): return soldier76[code]; break;
		default: break;
	}

}

// load images and resources
function preload() {

	game.load.image('gray',						'assets/gray.jpg');
	game.load.image('platform',					'assets/platform.jpg');


	game.load.image('soldier76Body',			'assets/soldier76/body.png');
	game.load.image('soldier76Arms',			'assets/soldier76/arms.png');

	game.load.image('heavyPulse',				'assets/soldier76/bullet.png');
	game.load.image('heavyPulseEffect',			'assets/soldier76/armsFire.png');
	game.load.image('helixRocket',				'assets/soldier76/helixRocket.png');
	
	game.load.audio('heavyPulseSound',			'assets/soldier76/fire.ogg');

	game.load.image('blue',						'assets/blue.png');




}

function create() {
    //control setup
    game.input.gamepad.start();
    
	this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;

    pad1 = game.input.gamepad.pad1;
    pad2 = game.input.gamepad.pad2;

    //  This will run in Canvas mode, so let's gain a little speed and display
    game.renderer.clearBeforeRender = false;
    game.renderer.roundPixels = true;

    //  We need arcade physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  Background
	game.add.tileSprite(0, 0, game.width, game.height, 'gray');

	//game sprites
	floor = game.add.sprite(400,600,'platform');
	floor.anchor.set(0.5,0.1);
	game.physics.enable(floor, Phaser.Physics.ARCADE);
	floor.body.immovable = true;
	floor.body.allowGravity = false;

	for(var i = 0; i < PLAYER_NUMBER; i++)
	{
		players[i] = new Player();

		//assign their number
		players[i].number = i;

		//sprite

		players[i].sprite = game.add.sprite(300, 400, 'soldier76Body');
		players[i].sprite.anchor.set(0.4,0);
		players[i].arms = game.add.sprite(300, 400, 'soldier76Arms');
		players[i].arms.anchor.set(0.4,0.3);
		game.physics.enable(players[i].sprite, Phaser.Physics.ARCADE);


		players[i].sprite.body.drag.set(0);
		players[i].sprite.body.maxVelocity.set(300);
		players[i].sprite.body.allowGravity = true;
		players[i].sprite.body.collideWorldBounds = true;
		players[i].sprite.body.gravity.y = PLAYER_GRAVITY;
		
	}//for

	//Players' pad
	switch(PLAYER_NUMBER)
	{
		case 4: players[3].pad = game.input.gamepad.pad1;
		case 3: players[2].pad = game.input.gamepad.pad1;
		case 2: players[1].pad = game.input.gamepad.pad1;
		case 1: players[0].pad = game.input.gamepad.pad1;
	}//switch



	//Test----------------------------------------------------------------------------------------------------------!!!!!!!!!!!!!!!!!!!!!!!!!!
	setHero(0, 'soldier76');
	players[0].weapon.onFire.add(
			function()
			{
				var music;
				music = game.add.audio('heavyPulseSound');
				music.play();
			}
		);
	players[0].weapon.fireLimit = 20;
	//---------------------------------------------------------------------------HELIX TEST---------------------------------
	weapon = game.add.weapon(3, 'helixRocket');
	weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
	weapon.bulletSpeed = 800;
	weapon.fireRate = 500;


	//applying gamepad type
	gamepadSetup();

    //  Game input
    cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);

	game.input.onDown.add(goFull, this);
}

function goFull() {
	    if (game.scale.isFullScreen) {
	        game.scale.stopFullScreen();
	    }
	    else {
	        game.scale.startFullScreen(false);
	    }
}

function update() {
	movePlayer();
	render();
}

function movePlayer()
{
	for(var i = 0; i < PLAYER_NUMBER; i++)
	{
		if(			Math.abs(padCode(2, i) )>PAD_LIMITER)
		{
			players[i].sprite.scale.x	= Math.abs(padCode(2, i))/padCode(2, i);
			players[i].arms.scale.y		= Math.abs(padCode(2, i))/padCode(2, i);
		}
		else if(	Math.abs(padCode(0, i))>PAD_LIMITER)
		{
			players[i].sprite.scale.x	= Math.abs(padCode(0, i))/padCode(0, i);
			players[i].arms.scale.y		= Math.abs(padCode(0, i))/padCode(0, i);
		}


		if(padCode(10, i)==1)
		{

			if(players[i].jump>0){
				players[i].sprite.body.y = players[i].sprite.body.y - 1;
				players[i].sprite.body.velocity = new Phaser.Point(players[i].sprite.body.velocity.x,-1000);
				players[i].jump--;
			}
		}
		if(padCode(10, i)==0)
		{
			players[i].jump = 0;
		}

		//collision
		if(game.physics.arcade.collide(players[i].sprite, floor))
		{
			friction(i);
		}

		//arms
		players[i].arms.x = players[i].sprite.x;
		players[i].arms.y = players[i].sprite.y+20;

		//Move pointer
		{
			var padx;
			var pady;
			var pointer = players[i].arms;

			if(Math.abs(padCode(0, i)) > PAD_LIMITER || Math.abs(padCode(1, i)) > PAD_LIMITER || Math.abs(padCode(2, i)) > PAD_LIMITER || Math.abs(padCode(3, i)) > PAD_LIMITER)
			{
				if(Math.abs(padCode(2, i)) > PAD_LIMITER || Math.abs(padCode(3, i)) > PAD_LIMITER)
				{
					padx = padCode(2, i);
					pady = padCode(3, i);
				}
				else
				{
					padx = padCode(0, i);
					pady = padCode(1, i);
				}

				// pointer.angle = ( Math.atan(pady/padx) * 180/Math.PI) + (players[i].sprite.scale.x-1)/2*180;
				pointer.angle = ( Math.asin(pady) * 180/Math.PI)*players[i].sprite.scale.x + (players[i].sprite.scale.x+padCode(20, i))*90;
			}

			players[i].pointer = pointer;

		}//move pointer

		{//normal shoot

			if(padCode(11, i) == 1)
			{
				players[i].arms.loadTexture('heavyPulseEffect');
				players[i].weapon.trackSprite(players[i].arms, 0, players[i].arms.scale.y*10, true);
				players[i].weapon.fire();
				console.log(players[i].weapon.fireLimit-players[i].weapon.shots);
			}
			else
			{
				players[i].arms.loadTexture('soldier76Arms');
			}

			if(padCode(9, i) == 1)
			{
				weapon.trackSprite(players[i].arms, 0, players[i].arms.scale.y*10, true);
				weapon.fire();
			}

			if(padCode(8, i) == 1)
			{
				players[i].weapon.resetShots();
			}

		}//normal shoot

		



	}//for loop - for all players

}//moveplayer

function toVector(x, y)
{
	//although this is Point, it is in vector
	var angle;
	var mag;

	mag = Math.pow( (Math.pow(x,2) + Math.pow(y,2)), 1/2);
	x = x/mag;
	y = y/mag;

	angle = Math.acos(x);
	if(Math.asin(y) < 0){
		angle = angle + Math.PI;
	}

	return new Phaser.Point(angle, mag);
}//toVector

function toXY(angle, mag)
{
	return new Phaser.Point(mag*Math.cos(angle), mag*Math.sin(angle));
}//toXY

function friction(i){


	var a = players[i].sprite.body.velocity.x;
	a = a/Math.abs(a);
	if(Math.abs(players[i].sprite.body.velocity.x) < 5){
		a = 0;
	}
	players[i].sprite.body.velocity = new Phaser.Point(players[i].sprite.body.velocity.x-(a*FRICTION), players[i].sprite.body.velocity.y);
	players[i].jump = JUMPHEIGHT;

	//controls
	if (players[i].pad.axis(0)<PAD_LIMITER)
	{
    	players[i].sprite.body.acceleration = new Phaser.Point(-MOVESPEED,players[i].sprite.body.acceleration.y);
	}

	if (players[i].pad.axis(0)>-PAD_LIMITER)
	{
		players[i].sprite.body.acceleration = new Phaser.Point(MOVESPEED,players[i].sprite.body.acceleration.y);
	}

	if(players[i].pad.axis(0) < PAD_LIMITER && players[i].pad.axis(0) > -PAD_LIMITER)
	{
		players[i].sprite.body.acceleration = new Phaser.Point(0,players[i].sprite.body.acceleration.y);
	}


}


function padCode(num, i)
{

	var TRIG_SENSITIVITY = 0.5;
	var p = players[i].pad;
	var type = players[i].gamepadType;
	var ds2DpadMean = 
	[3.2,
	-1, 0, 0.7, -0.4
	];
	var ds2DPadBound = 0.1;
	/*
	[
		ls x(0), ls y(1),
		rs x(2), rs y(3),

		btn: down(4), right(5), left(6), up(7),

		left bump(8), right bump(9),
		left trig(10), right trig(11),

		left mid(12), right mid(13),

		btn: ls(14), rs(15),

		dpad: up(16), down(17), left(18), right(19)

		(-1, or 1)//depending on controller# (20)
	]

	#must add 90 or -90, depending on controller, since y axis is flipped

	*/

	var xboxOne = 
	[
		p.axis(0), p.axis(1), p.axis(2), p.axis(3), p.isDown(0), p.isDown(1), p.isDown(2), p.isDown(3), 
		p.isDown(4), p.isDown(5), p.isDown(6), p.isDown(7), 
		p.isDown(8), p.isDown(9),
		p.isDown(10), p.isDown(11),
		p.isDown(12), p.isDown(13), p.isDown(14), p.isDown(15),
		-1
	];
	var dualShock2 = 
	[
		p.axis(0), p.axis(1), p.axis(5), p.axis(2), p.isDown(2), p.isDown(1), p.isDown(3), p.isDown(0),
		p.isDown(6), p.isDown(7), p.isDown(4), p.isDown(5), 
		p.isDown(8), p.isDown(9),
		p.isDown(10), p.isDown(11),
		p.axis(9) < ds2DpadMean[1] + ds2DPadBound && p.axis(9) > ds2DpadMean[1] - ds2DPadBound,
		p.axis(9) < ds2DpadMean[2] + ds2DPadBound && p.axis(9) > ds2DpadMean[2] - ds2DPadBound,
		p.axis(9) < ds2DpadMean[3] + ds2DPadBound && p.axis(9) > ds2DpadMean[3] - ds2DPadBound,
		p.axis(9) < ds2DpadMean[4] + ds2DPadBound && p.axis(9) > ds2DpadMean[4] - ds2DPadBound,
		-1
	];

	if(type === 'xboxOne')
	{
		return xboxOne[num];
	}
	if(type === 'dualShock2')
	{
		return dualShock2[num];
	}
	if(type === 'dualShock4')
	{
		//Not implemented yet
		console.log('Not implemented yet');
	}

}

function setHero(i, h)
{


	players[i].hero = h;

	//I eventually want to do this...
	//players[0].weapon = game.add.weapon(10. heroList(h,5));
	//......


	//but for now, just set it to soldier76
	players[0].weapon = game.add.weapon(10, 'heavyPulse');
	players[0].weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
	players[0].weapon.bulletSpeed = 800;
	players[0].weapon.fireRate = 120;
}

// function gunFireEffect(x,y) {

// 	//  Position the emitter where the mouse/touch event was
// 	var effect;

// 	effect = game.add.emitter();
//     effect.makeParticles('heavyPulseEffect');
//     effect.gravity = 0;

// 	effect.x = x;
// 	effect.y = y;

// 	//  The first parameter sets the effect to "explode" which means all particles are emitted at once
// 	//  The second gives each particle a 2000ms lifespan
// 	//  The third is ignored when using burst/explode mode
// 	//  The final parameter (10) is how many particles will be emitted in this single burst
// 	effect.start(false, 10, null, 1);

// }


function render() {
	// game.debug.spriteCoords(playerA,100,32);
	// console.log(padCode(9, 0));
}


