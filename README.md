# Chaos demonstration

## What is this?
This project demonstrates how chaotic systems work using simple physics in javascript. A key property of chaotic systems is its instability: sensitive dependence on initial
conditions. With small initial changes to the system, the future becomes chaotic and unpredictable. This is shown using these techinques.

This simulation is running on [my website](https://nivyanth.cloudns.cl/animations/chaos) if you’d like to check it out.

### Pool Box: 
This system is a non-chaotic. The balls are initialized with a velocity and gravity acts upon them causing change in velocity. The paths of the balls follow a definite pattern. Minute change in initial conditions doesnot make much difference in their paths.

### Circle Bounce Ball: 
This is a chaotic system. Gravity acts in the ball and the ball is released at a certain height. The ball bounces off the boundary of the circle mirrored off the normal from center of boundary circle to the impact point. The 'x' coordinate of the release point is slightly varied in factors of 1/1000 for the two balls and such subtle change completely makes the path of the ball chaotic just after few bounces.

### Concave Billiards: 
This is also a chaotic system where a system of balls are kept inside a boundary rectangle and a boundary with concave sides. When inside the rectangle, the balls bounce of perfectly and their paths are not chaotic and are traceable. But if we make the boundaries slightly concave, the system becomes chaotic. The paths of balls diverge within few bounces.

### Water Wheel:
The Malkus waterwheel, also referred to as the Lorenz waterwheel or chaotic waterwheel, is a mechanical model that exhibits chaotic dynamics. Its motion is governed by the Lorenz equations. While classical waterwheels rotate in one direction at a constant speed, the Malkus waterwheel exhibits chaotic motion where its rotation will speed up, slow down, stop, change directions, and oscillate back and forth between combinations of such behaviours in an unpredictable manner. The top most bucket if filled at constant rate and every bucket is also drained at constant rate. This shifts the centre of mass of system and creates torque which rotates the wheel.
The Center of mass of the system is plotted and traced. The path thus generated resembles a butterfly and is called the 'Lorenz Attractor'