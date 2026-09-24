import { GitHub } from '../index.model';

export interface IssueFieldValue {
    issue_field_id: number; // int64
    node_id: string;
    data_type: GitHub.Type.IssueFieldDataType;
    value: string | number | null;
    single_select_option?: GitHub.Model.SingleSelectOption | null;
}
