import {Schema, model} from "mongoose";

const RecipientSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    name: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        required: true,
    },
    addressLine1: {
        type: String,
        required: true,
    },
    addressLine2: {
        type: String,
        default: null
    },
    addressLine3: {
        type: String,
        default: null
    },
    countryCode: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    stateOrProvinceCode: {
        type: String,
        required: true,
    },
    postCode: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
    versionKey: false,
});

export default model("RecipientCustomer", RecipientSchema);