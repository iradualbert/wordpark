export default function () {
    return `<form id="form" method="POST">
            <div class="form-group">
                <label>Word / Phrase **</label>
                <input class="form-control" type="text" name="word" id="word" placeholder="New word or phrase.....">
            </div>
            <div class="form-group">
                <label>Meaning</label>
                <textarea class="form-control" type="text" name="meaning" id="meaning"
                    placeholder="Add meaning or context..."></textarea>
            </div>
            <div class="form-group">
                <label>Related Words</label>
                <textarea class="form-control" type="text" name="related" id="related"
                    placeholder="Add similar words..."></textarea>
            </div>
            <div class="form-group">
                <label>Translation</label>
                <input class="form-control" type="text" name="translation" id="translation" placeholder="Translation">
            </div>
            <!-- <div class="form-group">
                <select class="form-control" type="text" name="list" id="list" placeholder="Add context...">
                </select>
            </div> -->
            <div class="form-group">
                <button type="submit" class="btn btn-dark" id="submit-button" disabled>
                    Save
                    <div class="spinner-border text-primary none" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                </button>
            </div>

        </form>`
} 