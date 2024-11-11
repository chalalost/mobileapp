const Regex = {
    Regex_decimal: /^(?!\.)(?!.*\.\.)(\d+)(\.*)(\d+)?$/,// so thap phan lon hon 0 (khong nhan dau phay (,))
    Regex_Decimal_v2: /^(?!\.)(?!.*\.\.)(\d*[.,]?)(\d+)(\.*)(\d+)?$/,// so thap phan lon hon 0 (nhan ca dau phay (,))
    Regex_decimal_v1: /^(?!\.)(?!.*\.\.)(\d+)(\.*)(\d+)?$/,// so thap phan lon hon 0 (khong nhan dau phay (,)) khong 2 dau cham lien tiep
    Regex_integer: /^(\d+)(\d+)?$/,// so nguyen
    Regex_integer_with_negative: /^-?(\d+)(\d+)?$/,// so duong + am
    Regex_datetime: /([12][\d{4}]-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/
}

export { Regex }