export type Point = {
    x: number,
    y: number
}

export type BodyPart =
    | "left_face"
    | "right_face"
    | "left_upper_arm_front"
    | "left_upper_arm_back"
    | "right_upper_arm_front"
    | "right_upper_arm_back"
    | "left_lower_arm_front"
    | "left_lower_arm_back"
    | "right_lower_arm_front"
    | "right_lower_arm_back"
    | "left_hand"
    | "right_hand"
    | "torso_front"
    | "torso_back"
    | "left_upper_leg_front"
    | "left_upper_leg_back"
    | "right_upper_leg_front"
    | "right_upper_leg_back"
    | "left_lower_leg_front"
    | "left_lower_leg_back"
    | "right_lower_leg_front"
    | "right_lower_leg_back"
    | "left_feet"
    | "right_feet";

export type Target = {
    hp: number,
    details: {
        face: number,
        upperBody: number,
        leftArm: number,
        rightArm: number,
        leftHand: number,
        rightHand: number,
        leftLeg: number,
        rightLeg: number,
        leftFoot: number,
        rightFoot: number
    }
};