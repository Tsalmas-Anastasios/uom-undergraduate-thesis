export interface LdapServerConfig {
    label: string;
    host: string;
    port?: number | null;
    attribute_for_mail?: string;
    attribute_for_username?: string;
    app_dn: string;
    app_dn_password: string;
    search_base: string;
    search_filters?: string;
    use_tls?: boolean;
    certificate_path?: string | null;
    validate_cert?: boolean;
    ciphers?: string | null;
}
