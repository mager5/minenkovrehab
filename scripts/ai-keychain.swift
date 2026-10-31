import Foundation
import Security

// This helper only accesses the editor's own generic-password item.
// Secrets enter over stdin and return over a private pipe, never command arguments.
let action = CommandLine.arguments.dropFirst().first ?? ""
let testing = CommandLine.arguments.dropFirst(2).first == "--test"
let service = testing ? "ru.minenkovrehab.ai-test.openai.integration-test" : "ru.minenkovrehab.ai-test.openai"
let query: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrService as String: service,
    kSecAttrAccount as String: "local-editor",
    kSecUseDataProtectionKeychain as String: false,
]
func fail(_ status: OSStatus) -> Never {
    FileHandle.standardError.write(Data("keychain_error:\(status)\n".utf8))
    exit(1)
}
switch action {
case "save":
    let data = FileHandle.standardInput.readDataToEndOfFile()
    guard let key = String(data: data, encoding: .utf8),
          key.range(of: "^sk-[A-Za-z0-9_-]{16,300}$", options: .regularExpression) != nil else { exit(2) }
    let attributes = [kSecValueData as String: data]
    let status = SecItemUpdate(query as CFDictionary, attributes as CFDictionary)
    if status == errSecItemNotFound {
        var item = query
        item[kSecValueData as String] = data
        item[kSecAttrLabel as String] = "Minenkov Rehab — local AI editor"
        let added = SecItemAdd(item as CFDictionary, nil)
        if added != errSecSuccess { fail(added) }
    } else if status != errSecSuccess { fail(status) }
case "load":
    var search = query
    search[kSecReturnData as String] = true
    search[kSecMatchLimit as String] = kSecMatchLimitOne
    var result: CFTypeRef?
    let status = SecItemCopyMatching(search as CFDictionary, &result)
    if status == errSecItemNotFound { exit(0) }
    if status != errSecSuccess { fail(status) }
    guard let data = result as? Data else { exit(2) }
    FileHandle.standardOutput.write(data)
case "delete-test" where testing:
    let status = SecItemDelete(query as CFDictionary)
    if status != errSecSuccess && status != errSecItemNotFound { fail(status) }
default:
    exit(2)
}
