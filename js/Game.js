Ball.Game = function(game) {};
Ball.Game.prototype = {
	create: function() {
		this.add.sprite(0, 0, 'screen-bg');  
		this.add.sprite(0, 0, 'panel');
		this.physics.startSystem(Phaser.Physics.ARCADE);
		this.fontSmall = { font: "15px Arial", fill: "#02032a", fontWeight: "bold" };
		this.fontBig = { font: "24px Arial", fill: "#02032a" };
		this.fontMessage = { font: "24px Arial", fill: "#02032a",  align: "center", stroke: "#320C3E", strokeThickness: 4 };
		this.audioStatus = true;
		this.timer = 0;
		this.totalTimer = 0;
		this.level = 1;
		this.maxLevels = 5; //COLOCAR NUMERO DE FASES;
		this.movementForce = 10;
		this.ballStartPos = {x: Ball._WIDTH * 0.5, y: 450}; 

		this.pauseButton = this.add.button(Ball._WIDTH-8, 8, 'button-pause', this.managePause, this);
		this.pauseButton.anchor.set(1,0);
		this.pauseButton.input.useHandCursor = true;
		this.audioButton = this.add.button(Ball._WIDTH-this.pauseButton.width-8*2, 8, 'button-audio', this.manageAudio, this);
		this.audioButton.anchor.set(1,0);
		this.audioButton.input.useHandCursor = true;
		this.audioButton.animations.add('true', [0], 10, true);
		this.audioButton.animations.add('false', [1], 10, true);
		this.audioButton.animations.play(this.audioStatus);
		this.timerText = this.game.add.text(15, 15, "Time: "+this.timer, this.fontBig);
		this.levelText = this.game.add.text(120, 10, "Level: "+this.level+" / "+this.maxLevels, this.fontSmall);
		this.totalTimeText = this.game.add.text(120, 30, "Total time: "+this.totalTimer, this.fontSmall);

		this.hole = this.add.sprite(Ball._WIDTH*0.5, 90, 'hole');
		this.physics.enable(this.hole, Phaser.Physics.ARCADE);
		this.hole.anchor.set(0.5);
		this.hole.body.setSize(2, 2);

		this.ball = this.add.sprite(this.ballStartPos.x, this.ballStartPos.y, 'ball');
		this.ball.anchor.set(0.5);
		this.physics.enable(this.ball, Phaser.Physics.ARCADE);
		this.ball.body.setSize(18, 18);
		this.ball.body.bounce.set(0.3, 0.3);

		this.initLevels();
		this.showLevel(1);
		this.keys = this.game.input.keyboard.createCursorKeys();

		Ball._player = this.ball;
		window.addEventListener("deviceorientation", this.handleOrientation, true);

		this.time.events.loop(Phaser.Timer.SECOND, this.updateCounter, this);

		this.borderGroup = this.add.group();
		this.borderGroup.enableBody = true;
		this.borderGroup.physicsBodyType = Phaser.Physics.ARCADE;
		this.borderGroup.create(0, 50, 'border-horizontal');
		this.borderGroup.create(0, Ball._HEIGHT-2, 'border-horizontal');
		this.borderGroup.create(0, 0, 'border-vertical');
		this.borderGroup.create(Ball._WIDTH-2, 0, 'border-vertical');
		this.borderGroup.setAll('body.immovable', true);
		this.bounceSound = this.game.add.audio('audio-bounce');
	},
	initLevels: function() {
		this.levels = [];
		this.levelData = [
			
			//PREENCHER AS FASES COM AS IMAGENS HORIZONTAL E VERTICAL
			//fase 1
			[
				{x:  60 , y : 200 , t:'w'},

                {x : 85,  y: 320, t:'h'},
				{x : 230,  y: 105, t:'h'}
			],
			//fase 2
			[
				{x: 65, y:150, t:'w'},
				{x: 72 , y: 320 , t:'w'},

				{x: 200, y: 320, t:'h'},
				{x : 230,  y: 100, t:'h'}				

			 ],
			 //fase 3
			 [
				{x: 0, y: 240, t:'w'},
				{x: 128, y: 240 , t:'w'},

			    {x: 64, y:352 , t:'h'},
				{x: 224,y: 352, t:'h'},
				{x: 200,y: 52, t:'h'} 
			 ],
			 //fase 4
			 [
			    {x: 80, y: 105, t:'w'}, //1 Deitado
				{x: 190, y: 105, t:'w'}, //2
				{x: 0, y: 255 , t:'w'}, //3
				{x: 100, y: 360, t:'w'}, //4

				{x: 200, y: 105, t:'h'}, //3
				{x: 200, y: 315, t:'h'}, //4
			 ],
			 //fase 5
			 [
				{x: 80, y: 105, t:'w'}, //1 Deitado
				{x: 190, y: 105, t:'w'}, //2
				{x: -5, y: 255 , t:'w'}, //3
				{x: 170, y: 250 , t:'w'}, //4
				{x: 50, y: 305 , t:'w'}, //5
				{x: 30, y: 360, t:'w'}, //6

			    {x: 48, y: 105 , t:'h'}, //1 De pé
				{x: 105, y: 159, t:'h'}, //2
				{x: 200, y: 105, t:'h'}, //3
				{x: 200, y: 315, t:'h'}, //4
				{x: 100, y: 420, t:'h'},  //5
				{x: 260, y: 400, t:'h'}  //6
			 ]
		];
		
		for(var i=0; i<this.maxLevels; i++) {
			var newLevel = this.add.group();
			newLevel.enableBody = true;
			newLevel.physicsBodyType = Phaser.Physics.ARCADE;
			for(var e=0; e<this.levelData[i].length; e++) {
				var item = this.levelData[i][e];
				newLevel.create(item.x, item.y, 'element-'+item.t);
			}
			newLevel.setAll('body.immovable', true);
			newLevel.visible = false;
			this.levels.push(newLevel);
		}
	},
	showLevel: function(level) {
		var lvl = level | this.level;
		if(this.levels[lvl-2]) {
			this.levels[lvl-2].visible = false;
		}
		this.levels[lvl-1].visible = true;
	},
	updateCounter: function() {
		this.timer++;
		this.timerText.setText("Time: "+this.timer);
		this.totalTimeText.setText("Total time: "+(this.totalTimer+this.timer));
	},
	managePause: function() {
		this.game.paused = true;
		var pausedText = this.add.text(Ball._WIDTH*0.5, 250, "Game pausado,\naperte para continuar.", this.fontMessage);
		pausedText.anchor.set(0.5);
		this.input.onDown.add(function(){
			pausedText.destroy();
			this.game.paused = false;
		}, this);
	},
	manageAudio: function() {
		this.audioStatus =! this.audioStatus;
		this.audioButton.animations.play(this.audioStatus);
	},
	update: function() {
		if(this.keys.left.isDown) {
			this.ball.body.velocity.x -= this.movementForce;
		}
		else if(this.keys.right.isDown) {
			this.ball.body.velocity.x += this.movementForce;
		}
		if(this.keys.up.isDown) {
			this.ball.body.velocity.y -= this.movementForce;
		}
		else if(this.keys.down.isDown) {
			this.ball.body.velocity.y += this.movementForce;
		}
		this.physics.arcade.collide(this.ball, this.borderGroup, this.wallCollision, null, this);
		this.physics.arcade.collide(this.ball, this.levels[this.level-1], this.wallCollision, null, this);
		this.physics.arcade.overlap(this.ball, this.hole, this.finishLevel, null, this);
	},
	wallCollision: function() {
		if(this.audioStatus) {
			this.bounceSound.play();
		}
		// Vibration API
		if("vibrate" in window.navigator) {
			window.navigator.vibrate(100);
		}
	},
	handleOrientation: function(e) {
		// Device Orientation API
		var x = e.gamma; // range [-90,90], left-right
		var y = e.beta;  // range [-180,180], top-bottom
		var z = e.alpha; // range [0,360], up-down
		Ball._player.body.velocity.x += x;
		Ball._player.body.velocity.y += y*0.5;
	},
	finishLevel: function() {
		if(this.level >= this.maxLevels) {
			this.totalTimer += this.timer;
			alert('Parabéns!!! Você zerou o jogo em: '  +  this.totalTimer + 'segundos');
		

			this.game.state.start('MainMenu');
		}
		else {
		
		//PREENCHER AS CONDIÇÕES DE CADA FASE
		   if(this.level ==1)
		   {
		      	v = window.prompt("O método resolutivo de equação do primeiro grau é popularmente conhecido como fórmula de:")
			     if(v == "bhaskara")
			     {
			         alert('Parabéns!!! Fase ' + this.level + ' concluída');
					    this.level++;			
		       	}
			    else
			   {			
			  	     alert("Você errou a pergunta, você não irá para próxima fase :( ");				  	
			    }
			}
			
	            else if(this.level == 2)
		   {
		      	v = window.prompt("Na fórmula da área do círculo A = C / 2 * pi, C é:")
			     if(v == "circunferência")
			     {
			         alert('Parabéns!!! Fase ' + this.level + ' concluída');
					 this.level++;			
		       	}
			    else
			   {			
        			alert("Resposta Incorreta , você não vai para próxima fase :(");
			  	
			    }
			}
	        			
           else if(this.level == 3)
		   {
		      	v = window.prompt("Resolva: sen * sen + cos * cos =")
			     if(v == "1")
			     {
			         alert('Parabéns!!! Fase ' + this.level + ' concluída');
					 this.level++;			
		       	}
			    else
			   {			
        			alert("Resposta Incorreta , você não vai para próxima fase :(");
			  	
			    }
			}
			else if(this.level == 4)
		   {
		      	v = window.prompt("Na resolução de um exercício de matemática, qual forma geométrica indica que o exercício foi concluído?")
			     if(v == "quadrado")
			     {
			         alert('Parabéns!!! Fase ' + this.level + ' concluída');
					 this.level++;			
		       	}
			    else
			   {			
        			alert("Resposta Incorreta , você não vai para próxima fase :(");
			  	
			    }
			}
			else if(this.level == 5)
		   {
		      	v = window.prompt("O sinal do seno no primeiro e quarto quadrante é:")
			     if(v == "positivo")
			     {
			         alert('Parabéns!!! Fase ' + this.level + ' concluída');
					 this.level++;			
		       	}
			    else
			   {			
        			alert("Resposta Incorreta , você não vai para próxima fase :(");
			  	
			    }
			}
				
			this.totalTimer += this.timer;
			this.timer = 0;
            
			//PREENCHER A MENSAGEM DO TEMPO E VARIAVEL DO TEMPO
			this.timerText.setText("Time:  "+  this.timer);
			//	PREENCHER A MENSAGEM DO TEMPO TOTAL  E VARIAVEL DO TEMPO TOTAL 
			this.totalTimeText.setText("Total Time:    "+   this.totalTimer );
			//PREENCHER A MENSAGEM DE FASES  + A VARIAVEL  DA FASE ATUAL + A VARIAVEL DA NÚMERO MAXIMO DE FASES
			this.levelText.setText("Level: "+  this.level  +" / "+  this.maxLevels );
			this.ball.body.x = this.ballStartPos.x;
			this.ball.body.y = this.ballStartPos.y;
			this.ball.body.velocity.x = 0;
			this.ball.body.velocity.y = 0;
			this.showLevel();
			}
	},
	render: function() {
	// this.game.debug.body(this.ball);
	// this.game.debug.body(this.hole);
	}
};