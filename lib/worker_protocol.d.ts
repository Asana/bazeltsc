import * as $protobuf from "protobufjs";

/**
 * Namespace blaze.
 * @exports blaze
 * @namespace
 */
export namespace blaze {

    /**
     * Namespace worker.
     * @exports blaze.worker
     * @namespace
     */
    namespace worker {

        type Input$Properties = {
            path?: string;
            digest?: Uint8Array;
        };

        /**
         * Constructs a new Input.
         * @exports blaze.worker.Input
         * @constructor
         * @param {blaze.worker.Input$Properties=} [properties] Properties to set
         */
        class Input {

            /**
             * Constructs a new Input.
             * @exports blaze.worker.Input
             * @constructor
             * @param {blaze.worker.Input$Properties=} [properties] Properties to set
             */
            constructor(properties?: blaze.worker.Input$Properties);

            /**
             * Input path.
             * @type {string}
             */
            public path: string;

            /**
             * Input digest.
             * @type {Uint8Array}
             */
            public digest: Uint8Array;

            /**
             * Creates a new Input instance using the specified properties.
             * @param {blaze.worker.Input$Properties=} [properties] Properties to set
             * @returns {blaze.worker.Input} Input instance
             */
            public static create(properties?: blaze.worker.Input$Properties): blaze.worker.Input;

            /**
             * Encodes the specified Input message. Does not implicitly {@link blaze.worker.Input.verify|verify} messages.
             * @param {blaze.worker.Input$Properties} message Input message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            public static encode(message: blaze.worker.Input$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Input message, length delimited. Does not implicitly {@link blaze.worker.Input.verify|verify} messages.
             * @param {blaze.worker.Input$Properties} message Input message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            public static encodeDelimited(message: blaze.worker.Input$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Input message from the specified reader or buffer.
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {blaze.worker.Input} Input
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): blaze.worker.Input;

            /**
             * Decodes an Input message from the specified reader or buffer, length delimited.
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {blaze.worker.Input} Input
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): blaze.worker.Input;

            /**
             * Verifies an Input message.
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {?string} `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): string;

            /**
             * Creates an Input message from a plain object. Also converts values to their respective internal types.
             * @param {Object.<string,*>} object Plain object
             * @returns {blaze.worker.Input} Input
             */
            public static fromObject(object: { [k: string]: any }): blaze.worker.Input;

            /**
             * Creates an Input message from a plain object. Also converts values to their respective internal types.
             * This is an alias of {@link blaze.worker.Input.fromObject}.
             * @function
             * @param {Object.<string,*>} object Plain object
             * @returns {blaze.worker.Input} Input
             */
            public static from(object: { [k: string]: any }): blaze.worker.Input;

            /**
             * Creates a plain object from an Input message. Also converts values to other types if specified.
             * @param {blaze.worker.Input} message Input
             * @param {$protobuf.ConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            public static toObject(message: blaze.worker.Input, options?: $protobuf.ConversionOptions): { [k: string]: any };

            /**
             * Creates a plain object from this Input message. Also converts values to other types if specified.
             * @param {$protobuf.ConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            public toObject(options?: $protobuf.ConversionOptions): { [k: string]: any };

            /**
             * Converts this Input to JSON.
             * @returns {Object.<string,*>} JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        type WorkRequest$Properties = {
            "arguments"?: string[];
            inputs?: blaze.worker.Input$Properties[];
        };

        /**
         * Constructs a new WorkRequest.
         * @exports blaze.worker.WorkRequest
         * @constructor
         * @param {blaze.worker.WorkRequest$Properties=} [properties] Properties to set
         */
        class WorkRequest {

            /**
             * Constructs a new WorkRequest.
             * @exports blaze.worker.WorkRequest
             * @constructor
             * @param {blaze.worker.WorkRequest$Properties=} [properties] Properties to set
             */
            constructor(properties?: blaze.worker.WorkRequest$Properties);

            /**
             * WorkRequest arguments.
             * @type {Array.<string>}
             */
            public ["arguments"]: string[];

            /**
             * WorkRequest inputs.
             * @type {Array.<blaze.worker.Input$Properties>}
             */
            public inputs: blaze.worker.Input$Properties[];

            /**
             * Creates a new WorkRequest instance using the specified properties.
             * @param {blaze.worker.WorkRequest$Properties=} [properties] Properties to set
             * @returns {blaze.worker.WorkRequest} WorkRequest instance
             */
            public static create(properties?: blaze.worker.WorkRequest$Properties): blaze.worker.WorkRequest;

            /**
             * Encodes the specified WorkRequest message. Does not implicitly {@link blaze.worker.WorkRequest.verify|verify} messages.
             * @param {blaze.worker.WorkRequest$Properties} message WorkRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            public static encode(message: blaze.worker.WorkRequest$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified WorkRequest message, length delimited. Does not implicitly {@link blaze.worker.WorkRequest.verify|verify} messages.
             * @param {blaze.worker.WorkRequest$Properties} message WorkRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            public static encodeDelimited(message: blaze.worker.WorkRequest$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a WorkRequest message from the specified reader or buffer.
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {blaze.worker.WorkRequest} WorkRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): blaze.worker.WorkRequest;

            /**
             * Decodes a WorkRequest message from the specified reader or buffer, length delimited.
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {blaze.worker.WorkRequest} WorkRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): blaze.worker.WorkRequest;

            /**
             * Verifies a WorkRequest message.
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {?string} `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): string;

            /**
             * Creates a WorkRequest message from a plain object. Also converts values to their respective internal types.
             * @param {Object.<string,*>} object Plain object
             * @returns {blaze.worker.WorkRequest} WorkRequest
             */
            public static fromObject(object: { [k: string]: any }): blaze.worker.WorkRequest;

            /**
             * Creates a WorkRequest message from a plain object. Also converts values to their respective internal types.
             * This is an alias of {@link blaze.worker.WorkRequest.fromObject}.
             * @function
             * @param {Object.<string,*>} object Plain object
             * @returns {blaze.worker.WorkRequest} WorkRequest
             */
            public static from(object: { [k: string]: any }): blaze.worker.WorkRequest;

            /**
             * Creates a plain object from a WorkRequest message. Also converts values to other types if specified.
             * @param {blaze.worker.WorkRequest} message WorkRequest
             * @param {$protobuf.ConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            public static toObject(message: blaze.worker.WorkRequest, options?: $protobuf.ConversionOptions): { [k: string]: any };

            /**
             * Creates a plain object from this WorkRequest message. Also converts values to other types if specified.
             * @param {$protobuf.ConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            public toObject(options?: $protobuf.ConversionOptions): { [k: string]: any };

            /**
             * Converts this WorkRequest to JSON.
             * @returns {Object.<string,*>} JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        type WorkResponse$Properties = {
            exitCode?: number;
            output?: string;
        };

        /**
         * Constructs a new WorkResponse.
         * @exports blaze.worker.WorkResponse
         * @constructor
         * @param {blaze.worker.WorkResponse$Properties=} [properties] Properties to set
         */
        class WorkResponse {

            /**
             * Constructs a new WorkResponse.
             * @exports blaze.worker.WorkResponse
             * @constructor
             * @param {blaze.worker.WorkResponse$Properties=} [properties] Properties to set
             */
            constructor(properties?: blaze.worker.WorkResponse$Properties);

            /**
             * WorkResponse exitCode.
             * @type {number}
             */
            public exitCode: number;

            /**
             * WorkResponse output.
             * @type {string}
             */
            public output: string;

            /**
             * Creates a new WorkResponse instance using the specified properties.
             * @param {blaze.worker.WorkResponse$Properties=} [properties] Properties to set
             * @returns {blaze.worker.WorkResponse} WorkResponse instance
             */
            public static create(properties?: blaze.worker.WorkResponse$Properties): blaze.worker.WorkResponse;

            /**
             * Encodes the specified WorkResponse message. Does not implicitly {@link blaze.worker.WorkResponse.verify|verify} messages.
             * @param {blaze.worker.WorkResponse$Properties} message WorkResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            public static encode(message: blaze.worker.WorkResponse$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified WorkResponse message, length delimited. Does not implicitly {@link blaze.worker.WorkResponse.verify|verify} messages.
             * @param {blaze.worker.WorkResponse$Properties} message WorkResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            public static encodeDelimited(message: blaze.worker.WorkResponse$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a WorkResponse message from the specified reader or buffer.
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {blaze.worker.WorkResponse} WorkResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): blaze.worker.WorkResponse;

            /**
             * Decodes a WorkResponse message from the specified reader or buffer, length delimited.
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {blaze.worker.WorkResponse} WorkResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): blaze.worker.WorkResponse;

            /**
             * Verifies a WorkResponse message.
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {?string} `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): string;

            /**
             * Creates a WorkResponse message from a plain object. Also converts values to their respective internal types.
             * @param {Object.<string,*>} object Plain object
             * @returns {blaze.worker.WorkResponse} WorkResponse
             */
            public static fromObject(object: { [k: string]: any }): blaze.worker.WorkResponse;

            /**
             * Creates a WorkResponse message from a plain object. Also converts values to their respective internal types.
             * This is an alias of {@link blaze.worker.WorkResponse.fromObject}.
             * @function
             * @param {Object.<string,*>} object Plain object
             * @returns {blaze.worker.WorkResponse} WorkResponse
             */
            public static from(object: { [k: string]: any }): blaze.worker.WorkResponse;

            /**
             * Creates a plain object from a WorkResponse message. Also converts values to other types if specified.
             * @param {blaze.worker.WorkResponse} message WorkResponse
             * @param {$protobuf.ConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            public static toObject(message: blaze.worker.WorkResponse, options?: $protobuf.ConversionOptions): { [k: string]: any };

            /**
             * Creates a plain object from this WorkResponse message. Also converts values to other types if specified.
             * @param {$protobuf.ConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            public toObject(options?: $protobuf.ConversionOptions): { [k: string]: any };

            /**
             * Converts this WorkResponse to JSON.
             * @returns {Object.<string,*>} JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }
}
