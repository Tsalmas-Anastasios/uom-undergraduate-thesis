export interface ChatPermissions {
    controls?: boolean;
    valves?: boolean;
    system_prompt?: boolean;
    params?: boolean;
    file_upload?: boolean;
    delete?: boolean;
    delete_message?: boolean;
    continue_response?: boolean;
    regenerate_response?: boolean;
    rate_response?: boolean;
    edit?: boolean;
    share?: boolean;
    export?: boolean;
    stt?: boolean;
    tts?: boolean;
    call?: boolean;
    multiple_models?: boolean;
    temporary?: boolean;
    temporary_enforced?: boolean;
}
